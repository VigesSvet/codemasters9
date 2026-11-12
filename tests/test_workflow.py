"""Тесты workflow: цепочка статусов, версии, 409, неизменность files.access."""

from __future__ import annotations

H = {"X-Requested-With": "gos"}


def test_chain_draft_to_published(client, login, db):
    unit_id = db.execute("SELECT id FROM units WHERE code = 'T-004'").fetchone()["id"]
    login("moderator")
    for to in ("review", "needs_work", "review", "approved", "published"):
        assert (
            client.post(f"/api/admin/units/{unit_id}/transition", json={"to": to}, headers=H).status_code
            == 200
        )
    row = db.execute("SELECT version, pub_status FROM units WHERE id = ?", (unit_id,)).fetchone()
    assert row["pub_status"] == "published"
    assert row["version"] == 6
    versions = db.execute(
        "SELECT version, reviewer_id FROM unit_versions WHERE unit_id = ? ORDER BY version", (unit_id,)
    ).fetchall()
    assert [v["version"] for v in versions] == [2, 3, 4, 5, 6]
    moderator_id = db.execute("SELECT id FROM users WHERE username = 'moderator'").fetchone()["id"]
    assert versions[0]["reviewer_id"] is None  # отправка на проверку
    assert versions[2]["reviewer_id"] is None  # повторная отправка
    assert versions[-2]["reviewer_id"] == moderator_id  # approved
    assert versions[-1]["reviewer_id"] == moderator_id  # published


def test_invalid_transition_409(client, login, db):
    unit_id = db.execute("SELECT id FROM units WHERE code = 'T-004'").fetchone()["id"]  # draft
    login("admin")
    r = client.post(f"/api/admin/units/{unit_id}/transition", json={"to": "published"}, headers=H)
    assert r.status_code == 409


def test_publish_does_not_change_files_access(client, login, db):
    unit_id = db.execute("SELECT id FROM units WHERE code = 'T-004'").fetchone()["id"]
    db.execute(
        "INSERT INTO files (unit_id, filename, mime, size, kind, access) VALUES (?,?,?,?,?,?)",
        (unit_id, "x.pdf", "application/pdf", 10, "view", "needs_check"),
    )
    db.commit()
    login("moderator")
    for to in ("review", "approved", "published"):
        assert (
            client.post(f"/api/admin/units/{unit_id}/transition", json={"to": to}, headers=H).status_code
            == 200
        )
    access = db.execute("SELECT access FROM files WHERE unit_id = ?", (unit_id,)).fetchone()["access"]
    assert access == "needs_check"
