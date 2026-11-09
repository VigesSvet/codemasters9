/* Демо-данные макета (вымышленные шифры/объёмы; адреса и телефоны филиалов — из docs/research/current-site-data.json). */
const tr = (ru, kk, en) => ({ ru, kk, en });
window.tr = tr;

window.PLACES = {
  ukg: tr("Усть-Каменогорск", "Өскемен", "Ust-Kamenogorsk"),
  sem: tr("Семипалатинск (Семей)", "Семей", "Semipalatinsk (Semey)"),
  rid: tr("Риддер", "Риддер", "Ridder"),
  zai: tr("Зайсан", "Зайсан", "Zaisan"),
  alt: tr("Зыряновск (Алтай)", "Зырян (Алтай)", "Zyryanovsk (Altai)")
};
window.THEMES = {
  adm: tr("Государственное управление", "Мемлекеттік басқару", "Public administration"),
  town: tr("История городов и посёлков", "Қалалар мен елді мекендер тарихы", "History of towns and settlements"),
  pop: tr("Население и перепись", "Халық және санақ", "Population and census"),
  ind: tr("Промышленность", "Өнеркәсіп", "Industry"),
  war: tr("Военная история", "Әскери тарих", "Military history"),
  cult: tr("Культура и быт", "Мәдениет және тұрмыс", "Culture and everyday life"),
  fam: tr("История семьи и поколений", "Отбасы мен ұрпақ тарихы", "Family history"),
  org: tr("Общественные организации", "Қоғамдық ұйымдар", "Public organisations")
};
window.PERIODS = {
  p1: tr("До 1861", "1861 жылға дейін", "Before 1861"),
  p2: tr("1861–1917", "1861–1917", "1861–1917"),
  p3: tr("1917–1941", "1917–1941", "1917–1941"),
  p4: tr("1941–1945", "1941–1945", "1941–1945"),
  p5: tr("1946–1991", "1946–1991", "1946–1991"),
  p6: tr("С 1991", "1991 жылдан", "Since 1991")
};
window.PER_RANGE = { p1: [0, 1860], p2: [1861, 1917], p3: [1917, 1941], p4: [1941, 1945], p5: [1946, 1991], p6: [1991, 2100] };
window.TYPES = {
  file: tr("Архивное дело", "Архив ісі", "Archival file"),
  book: tr("Метрическая книга", "Метрикалық кітап", "Parish register"),
  photo: tr("Фотография, гравюра", "Фотосурет, гравюра", "Photograph, engraving"),
  map: tr("Карта, чертёж", "Карта, сызба", "Map, drawing"),
  print: tr("Печатное издание", "Баспа басылым", "Printed publication"),
  pers: tr("Документы личного происхождения", "Жеке шығу тегі құжаттары", "Personal papers")
};
window.ORGS = {
  gov: tr("Канцелярия военного губернатора", "Әскери губернатор кеңсесі", "Military Governor's chancellery"),
  duh: tr("Духовное правление", "Рухани басқарма", "Ecclesiastical board"),
  isp: tr("Уездный исполнительный комитет", "Уездік атқару комитеті", "District executive committee"),
  mine: tr("Риддерский рудник", "Риддер кеніші", "Ridder mine"),
  coll: tr("Фотоколлекция «Прииртышье»", "«Ертіс өңірі» фотоколлекциясы", "Photo collection “Irtysh region”"),
  pr: tr("Частное лицо (краевед)", "Жеке тұлға (өлкетанушы)", "Private individual (local historian)")
};
window.ACCESS = {
  open: tr("Открытый", "Ашық", "Open"),
  limited: tr("Ограниченный", "Шектеулі", "Restricted"),
  closed: tr("Закрытый", "Жабық", "Closed")
};
window.LANGS = { ru: tr("Русский", "Орыс тілі", "Russian"), kk: tr("Казахский", "Қазақ тілі", "Kazakh"), mix: tr("Русский, казахский", "Орыс, қазақ тілдері", "Russian, Kazakh") };
window.BR_NAMES = {
  main: tr("Основное здание, Усть-Каменогорск", "Негізгі ғимарат, Өскемен", "Main building, Ust-Kamenogorsk"),
  ukg: tr("Усть-Каменогорский филиал по личному составу", "Өскемен филиалы (жеке құрам бойынша)", "Ust-Kamenogorsk branch (personnel records)"),
  zai: tr("Зайсанский филиал", "Зайсан филиалы", "Zaisan branch"),
  rid: tr("Риддерский филиал", "Риддер филиалы", "Ridder branch"),
  alt: tr("Филиал Алтай (бывш. Зыряновский)", "Алтай филиалы (бұрынғы Зырян)", "Altai branch (former Zyryanovsk)")
};

/* ---- фонды (список для вкладки «Фонды» и фильтров) ---- */
window.FONDS = [
  { k: "1-P", no: "1-П", t: tr("Канцелярия военного губернатора Семипалатинской области", "Семей облысы әскери губернаторының кеңсесі", "Chancellery of the Military Governor of Semipalatinsk Region"), y: [1854, 1917], ops: 3, units: 1240, place: "sem", branch: "main", th: ["adm", "pop"], org: "gov" },
  { k: "14-F", no: "14-Ф", t: tr("Фотоколлекция «Прииртышье»", "«Ертіс өңірі» фотоколлекциясы", "Photo collection “Irtysh region”"), y: [1860, 1930], ops: 2, units: 3120, place: "sem", branch: "main", th: ["cult", "town"], org: "coll" },
  { k: "33-M", no: "33-М", t: tr("Духовное правление. Метрические книги", "Рухани басқарма. Метрикалық кітаптар", "Ecclesiastical board. Parish registers"), y: [1850, 1918], ops: 3, units: 3540, place: "sem", branch: "main", th: ["fam"], org: "duh" },
  { k: "71-R", no: "71-Р", t: tr("Усть-Каменогорский уездный исполнительный комитет", "Өскемен уездік атқару комитеті", "Ust-Kamenogorsk district executive committee"), y: [1919, 1928], ops: 2, units: 980, place: "ukg", branch: "main", th: ["adm"], org: "isp" },
  { k: "150-L", no: "150-Л", t: tr("Личный фонд краеведа", "Өлкетанушының жеке қоры", "Personal fonds of a local historian"), y: [1890, 1951], ops: 1, units: 67, place: "ukg", branch: "main", th: ["cult"], org: "pr" },
  { k: "205-K", no: "205-К", t: tr("Карты и планы Семиреченского и Семипалатинского краёв", "Жетісу және Семей өлкелерінің карталары мен жоспарлары", "Maps and plans of the Semirechye and Semipalatinsk lands"), y: [1840, 1910], ops: 1, units: 214, place: "zai", branch: "zaisan", th: ["town"], org: "gov" },
  { k: "412-F", no: "412-Ф", t: tr("Риддерское горное управление", "Риддер тау-кен басқармасы", "Ridder mining administration"), y: [1909, 1941], ops: 2, units: 1860, place: "rid", branch: "ridder", th: ["ind"], org: "mine" }
];

/* ---- дела: демо-выборка для выдачи (всего в каталоге 412 868; здесь 17 записей) ---- */
window.ITEMS = [
  { id: "1-P/1/245", f: "1-P", op: 1, d: 245, cat: "files", t: tr("Обзор Семипалатинской области за 1893 год", "1893 жылғы Семей облысына шолу", "Survey of Semipalatinsk Region for 1893"), y: [1893, 1894], type: "print", per: "p2", th: ["pop", "adm"], place: "sem", org: "gov", kw: "обзор народонаселение земледелие торговля школы уезды", lang: "ru", sheets: 48, dig: true, acc: "open", br: "main", img: "scan-1893.jpg" },
  { id: "1-P/1/312", f: "1-P", op: 1, d: 312, cat: "files", t: tr("Перепись населения Семипалатинской области, 1905", "Семей облысы халқының санағы, 1905", "Population census of Semipalatinsk Region, 1905"), y: [1905, 1906], type: "print", per: "p2", th: ["pop"], place: "sem", org: "gov", kw: "перепись население сословия уезды", lang: "ru", sheets: 212, dig: true, acc: "open", br: "main", img: "scan-1905.jpg" },
  { id: "1-P/2/18", f: "1-P", op: 2, d: 18, cat: "files", t: tr("Дело об утверждении герба города Семипалатинска", "Семей қаласының елтаңбасын бекіту ісі", "File on the approval of the coat of arms of Semipalatinsk"), y: [1851, 1852], type: "file", per: "p2", th: ["adm", "town"], place: "sem", org: "gov", kw: "герб утверждение город символика", lang: "ru", sheets: 14, dig: true, acc: "open", br: "main", img: "winkler-1851.jpg" },
  { id: "14-F/1/28", f: "14-F", op: 1, d: 28, cat: "photos", t: tr("Базар в Семипалатинске, 1885", "Семейдегі базар, 1885", "Bazaar in Semipalatinsk, 1885"), y: [1885, 1885], type: "photo", per: "p2", th: ["cult", "town"], place: "sem", org: "coll", kw: "базар торговля верблюды площадь фотография", lang: "ru", sheets: 1, dig: true, acc: "open", br: "main", img: "bazaar-1885.jpg" },
  { id: "14-F/1/52", f: "14-F", op: 1, d: 52, cat: "photos", t: tr("Усть-Каменогорск, гравюра 1891", "Өскемен, 1891 жылғы гравюра", "Ust-Kamenogorsk, engraving of 1891"), y: [1891, 1891], type: "photo", per: "p2", th: ["town"], place: "ukg", org: "coll", kw: "усть-каменогорск гравюра город крепость", lang: "ru", sheets: 1, dig: true, acc: "open", br: "main", img: "exile-1891.jpg" },
  { id: "14-F/1/31", f: "14-F", op: 1, d: 31, cat: "photos", t: tr("Паромная переправа через Иртыш, 1885", "Ертістегі паром өткелі, 1885", "Ferry crossing of the Irtysh, 1885"), y: [1885, 1885], type: "photo", per: "p2", th: ["town", "cult"], place: "sem", org: "coll", kw: "паром иртыш переправа река", lang: "ru", sheets: 1, dig: true, acc: "open", br: "main", img: "ferry-1885.jpg" },
  { id: "14-F/1/7", f: "14-F", op: 1, d: 7, cat: "photos", t: tr("Семипалатинск, вид с Усть-Каменогорского выезда, 1867", "Семей, Өскемен жолы жағынан көрініс, 1867", "Semipalatinsk, view from the Ust-Kamenogorsk road, 1867"), y: [1867, 1867], type: "photo", per: "p2", th: ["town"], place: "sem", org: "coll", kw: "семипалатинск вид город панорама", lang: "ru", sheets: 1, dig: true, acc: "open", br: "main", img: "semipalatinsk-1867.jpg" },
  { id: "14-F/1/12", f: "14-F", op: 1, d: 12, cat: "photos", t: tr("Семипалатинск с левого берега Иртыша, 1885", "Ертістің сол жағалауынан Семей, 1885", "Semipalatinsk from the left bank of the Irtysh, 1885"), y: [1885, 1885], type: "photo", per: "p2", th: ["town"], place: "sem", org: "coll", kw: "семипалатинск иртыш берег панорама", lang: "ru", sheets: 1, dig: true, acc: "open", br: "main", img: "semipalatinsk-1885.jpg" },
  { id: "14-F/1/44", f: "14-F", op: 1, d: 44, cat: "photos", t: tr("Аул близ Семипалатинска, 1885", "Семей маңындағы ауыл, 1885", "An aul near Semipalatinsk, 1885"), y: [1885, 1885], type: "photo", per: "p2", th: ["cult"], place: "sem", org: "coll", kw: "аул юрта быт кочевники", lang: "ru", sheets: 1, dig: true, acc: "open", br: "main", img: "aul-1885.jpg" },
  { id: "71-R/1/9", f: "71-R", op: 1, d: 9, cat: "photos", t: tr("Конный отряд на городской улице. Кадр хроники, 1919", "Қала көшесіндегі атты жасақ. Хроника кадры, 1919", "Mounted detachment on a city street. Newsreel frame, 1919"), y: [1919, 1919], type: "photo", per: "p3", th: ["war", "adm"], place: "sem", org: "isp", kw: "хроника отряд всадники гражданская война улица", lang: "ru", sheets: 1, dig: true, acc: "open", br: "main", img: "alash-1919.jpg" },
  { id: "33-M/1/412", f: "33-M", op: 1, d: 412, cat: "files", t: tr("Метрическая книга церкви Семипалатинска, 1903 год", "Семей шіркеуінің метрикалық кітабы, 1903 жыл", "Parish register of a Semipalatinsk church, 1903"), y: [1903, 1903], type: "book", per: "p2", th: ["fam"], place: "sem", org: "duh", kw: "метрические книги рождения браки смерти семья", lang: "ru", sheets: 164, dig: true, acc: "open", br: "main", img: null },
  { id: "33-M/1/655", f: "33-M", op: 1, d: 655, cat: "files", t: tr("Метрическая книга церкви Усть-Каменогорска, 1908 год", "Өскемен шіркеуінің метрикалық кітабы, 1908 жыл", "Parish register of an Ust-Kamenogorsk church, 1908"), y: [1908, 1908], type: "book", per: "p2", th: ["fam"], place: "ukg", org: "duh", kw: "метрические книги рождения браки смерти семья", lang: "ru", sheets: 188, dig: false, acc: "open", br: "main", img: null },
  { id: "412-F/1/15", f: "412-F", op: 1, d: 15, cat: "files", t: tr("Отчёт Риддерского рудника за 1913 год", "Риддер кенішінің 1913 жылғы есебі", "Annual report of the Ridder mine for 1913"), y: [1913, 1914], type: "file", per: "p2", th: ["ind"], place: "rid", org: "mine", kw: "рудник отчёт добыча свинец цинк производство", lang: "ru", sheets: 96, dig: false, acc: "open", br: "ridder", img: null },
  { id: "412-F/2/88", f: "412-F", op: 2, d: 88, cat: "files", t: tr("Личные дела рабочих рудника, 1909–1920", "Кеніш жұмысшыларының жеке істері, 1909–1920", "Personnel files of mine workers, 1909–1920"), y: [1909, 1920], type: "file", per: "p2", th: ["ind"], place: "rid", org: "mine", kw: "личные дела рабочие персональные данные", lang: "ru", sheets: 320, dig: false, acc: "limited", br: "ridder", img: null },
  { id: "205-K/1/9", f: "205-K", op: 1, d: 9, cat: "maps", t: tr("План Зайсанского поста, 1880-е годы", "Зайсан бекетінің жоспары, 1880-жылдар", "Plan of the Zaisan post, 1880s"), y: [1880, 1889], type: "map", per: "p2", th: ["town"], place: "zai", org: "gov", kw: "план пост чертёж зайсан карта", lang: "ru", sheets: 3, dig: false, acc: "open", br: "zaisan", img: null },
  { id: "150-L/1/3", f: "150-L", op: 1, d: 3, cat: "personal", t: tr("Письма и дневники краеведа, 1912–1938", "Өлкетанушының хаттары мен күнделіктері, 1912–1938", "Letters and diaries of a local historian, 1912–1938"), y: [1912, 1938], type: "pers", per: "p3", th: ["cult", "fam"], place: "ukg", org: "pr", kw: "письма дневник краевед воспоминания", lang: "mix", sheets: 120, dig: false, acc: "limited", br: "main", img: null },
  { id: "71-R/1/45", f: "71-R", op: 1, d: 45, cat: "files", t: tr("Протоколы заседаний Усть-Каменогорского уездного исполкома, 1921", "Өскемен уездік атқару комитеті отырыстарының хаттамалары, 1921", "Minutes of the Ust-Kamenogorsk district executive committee, 1921"), y: [1921, 1921], type: "file", per: "p3", th: ["adm"], place: "ukg", org: "isp", kw: "протоколы исполком заседания управление", lang: "ru", sheets: 140, dig: false, acc: "open", br: "main", img: null }
];

/* ---- структура фондов для fond.html ---- */
window.FOND_FULL = {
  "1-P": {
    cipher: "Ф. 1-П",
    intro: tr("Фонд канцелярии военного губернатора Семипалатинской области содержит годовые отчёты, статистические сведения, дела об устройстве городов и переписку по управлению областью. Дела дореформенной орфографии; печатные обзоры области сопровождаются картами и таблицами.", "Семей облысы әскери губернаторы кеңсесінің қорында жылдық есептер, статистикалық мәліметтер, қалаларды орналастыру істері және облысты басқару жөніндегі хат-хабарлар бар. Істер реформаға дейінгі емлемен жазылған; облыстың баспа шолуларына карталар мен кестелер қоса берілген.", "The fonds of the Military Governor's chancellery holds annual reports, statistical returns, files on the planning of towns and correspondence on the administration of the region. Files use pre-reform orthography; printed surveys of the region come with maps and tables."),
    ops: [
      { n: 1, t: tr("Дела общего делопроизводства", "Жалпы іс жүргізу істері", "General office files"), y: "1854–1917", c: 312, units: [
        { d: 1, t: tr("Годовой отчёт военного губернатора за 1854 год", "Әскери губернатордың 1854 жылғы жылдық есебі", "Annual report of the military governor for 1854"), y: "1855", s: 62, a: "open", g: true },
        { d: 120, t: tr("Годовой отчёт военного губернатора за 1892 год", "Әскери губернатордың 1892 жылғы жылдық есебі", "Annual report of the military governor for 1892"), y: "1893", s: 74, a: "open", g: true },
        { d: 245, t: tr("Обзор Семипалатинской области за 1893 год", "1893 жылғы Семей облысына шолу", "Survey of Semipalatinsk Region for 1893"), y: "1894", s: 48, a: "open", g: true },
        { d: 246, t: tr("Обзор Семипалатинской области за 1894 год", "1894 жылғы Семей облысына шолу", "Survey of Semipalatinsk Region for 1894"), y: "1895", s: 52, a: "open", g: true },
        { d: 312, t: tr("Перепись населения Семипалатинской области, 1905", "Семей облысы халқының санағы, 1905", "Population census of Semipalatinsk Region, 1905"), y: "1905–1906", s: 212, a: "open", g: true }
      ] },
      { n: 2, t: tr("Дела об устройстве городов", "Қалаларды орналастыру істері", "Files on the planning of towns"), y: "1856–1916", c: 480, units: [
        { d: 18, t: tr("Дело об утверждении герба города Семипалатинска", "Семей қаласының елтаңбасын бекіту ісі", "File on the approval of the coat of arms of Semipalatinsk"), y: "1851–1852", s: 14, a: "open", g: true },
        { d: 57, t: tr("О размежевании городских земель Усть-Каменогорска", "Өскемен қаласының жерлерін межелеу туралы", "On the demarcation of urban land in Ust-Kamenogorsk"), y: "1872–1874", s: 38, a: "open", g: false },
        { d: 131, t: tr("О переустройстве Базарной площади Семипалатинска", "Семейдегі Базар алаңын қайта жоспарлау туралы", "On the redevelopment of the Bazaar Square in Semipalatinsk"), y: "1884–1886", s: 56, a: "open", g: false }
      ] },
      { n: 3, t: tr("Секретные дела", "Құпия істер", "Confidential files"), y: "1862–1917", c: 448, units: [
        { d: 7, t: tr("Переписка о политическом надзоре (сведения о частных лицах)", "Саяси қадағалау туралы хат-хабар (жеке тұлғалар туралы мәліметтер)", "Correspondence on political surveillance (information about private persons)"), y: "1880–1895", s: 120, a: "closed", g: false },
        { d: 44, t: tr("Дела по личному составу чиновников области", "Облыс шенеуніктерінің жеке құрамы бойынша істер", "Personnel files of regional officials"), y: "1890–1910", s: 210, a: "limited", g: false }
      ] }
    ]
  },
  "33-M": {
    cipher: "Ф. 33-М",
    intro: tr("Метрические книги записывали рождения, браки и смерти по приходам. Фонд собран по городам Прииртышья; книги за 1900-е годы доступны для просмотра частично, остальные описаны без сканов. Сведения о лицах, родившихся менее 100 лет назад, имеют ограниченный доступ.", "Метрикалық кітаптарға туу, неке және өлім фактілері приходтар бойынша жазылған. Қор Ертіс өңірі қалалары бойынша жиналған; 1900-жылдардағы кітаптар ішінара қолжетімді, қалғандары сканерсіз сипатталған. Туғанына 100 жылдан аз уақыт өткен адамдар туралы мәліметтерге қолжетімділік шектеулі.", "Parish registers recorded births, marriages and deaths by parish. The fonds is assembled by the towns of the Irtysh region; books of the 1900s are partly viewable online, the rest are described without scans. Information on persons born less than 100 years ago is restricted."),
    ops: [
      { n: 1, t: tr("Семипалатинск", "Семей", "Semipalatinsk"), y: "1850–1918", c: 1900, units: [
        { d: 410, t: tr("Метрическая книга церкви Семипалатинска, 1900 год", "Семей шіркеуінің метрикалық кітабы, 1900 жыл", "Parish register of a Semipalatinsk church, 1900"), y: "1900", s: 158, a: "open", g: true },
        { d: 412, t: tr("Метрическая книга церкви Семипалатинска, 1903 год", "Семей шіркеуінің метрикалық кітабы, 1903 жыл", "Parish register of a Semipalatinsk church, 1903"), y: "1903", s: 164, a: "open", g: true },
        { d: 470, t: tr("Метрическая книга церкви Семипалатинска, 1906 год", "Семей шіркеуінің метрикалық кітабы, 1906 жыл", "Parish register of a Semipalatinsk church, 1906"), y: "1906", s: 171, a: "open", g: true }
      ] },
      { n: 2, t: tr("Усть-Каменогорск", "Өскемен", "Ust-Kamenogorsk"), y: "1860–1918", c: 1100, units: [
        { d: 655, t: tr("Метрическая книга церкви Усть-Каменогорска, 1908 год", "Өскемен шіркеуінің метрикалық кітабы, 1908 жыл", "Parish register of an Ust-Kamenogorsk church, 1908"), y: "1908", s: 188, a: "open", g: false }
      ] },
      { n: 3, t: tr("Зайсан и Зайсанский уезд", "Зайсан және Зайсан уезі", "Zaisan and Zaisan district"), y: "1870–1918", c: 540, units: [
        { d: 801, t: tr("Метрическая книга церкви Зайсана, 1904 год", "Зайсан шіркеуінің метрикалық кітабы, 1904 жыл", "Parish register of a Zaisan church, 1904"), y: "1904", s: 96, a: "open", g: false }
      ] }
    ]
  }
};

/* ---- филиалы. Координаты: Nominatim (OSM) по адресу, запрос 2026-11-09, см. geosrc ---- */
window.BRANCHES = [
  { id: "main", type: "main", n: 1, name: tr("Государственный архив ВКО (основное здание)", "ШҚО мемлекеттік архиві (негізгі ғимарат)", "State Archive of East Kazakhstan (main building)"), city: "ukg",
    addr: tr("070004, г. Усть-Каменогорск, ул. Головкова, 26/1", "070004, Өскемен қ., Головков көш., 26/1", "070004, Ust-Kamenogorsk, Golovkov St., 26/1"),
    phones: ["8 (7232) 25-59-76"], email: "arhiv-ukg@yandex.kz",
    hours: tr("пн–пт 9:00–18:00", "Дс–Жм 9:00–18:00", "Mon–Fri 9:00–18:00"),
    desc: tr("Основан в 1940 году. Хранит основные фонды, электронный фондовый каталог и фотоколлекции.", "1940 жылы құрылған. Негізгі қорларды, электрондық қор каталогын және фотоколлекцияларды сақтайды.", "Founded in 1940. Holds the main fonds, the electronic fonds catalogue and photo collections."),
    funds: tr("Ф. 1-П, 14-Ф, 33-М, 71-Р, 150-Л", "Қ. 1-П, 14-Ф, 33-М, 71-Р, 150-Л", "Fonds 1-P, 14-F, 33-M, 71-R, 150-L"),
    lat: 49.9484, lon: 82.6283, geosrc: "ГАВКО, ул. Головкова, 26/1: Nominatim не нашёл номер дома; точка — по центру Усть-Каменогорска/улицы, требует уточнения" },
  { id: "reading", type: "reading", n: 2, name: tr("Читальный зал (ул. Крылова)", "Оқу залы (Крылов көшесі)", "Reading room (Krylov St.)"), city: "ukg",
    addr: tr("070004, г. Усть-Каменогорск, ул. Крылова, 39", "070004, Өскемен қ., Крылов көш., 39", "070004, Ust-Kamenogorsk, Krylov St., 39"),
    phones: ["8 (7232) 25-13-47"], email: "arhiv-ukg@yandex.kz",
    hours: tr("пн–пт 10:00–17:00", "Дс–Жм 10:00–17:00", "Mon–Fri 10:00–17:00"),
    desc: tr("Читальный зал для работы с подлинниками. Сайт заявок не принимает: справки по телефону.", "Түпнұсқалармен жұмыс істеуге арналған оқу залы. Сайт өтініш қабылдамайды: анықтама телефон бойынша.", "Reading room for work with originals. The website accepts no requests: enquiries by phone."),
    funds: tr("Выдача дел читателям", "Оқырмандарға істерді беру", "Files issued to readers"),
    lat: 49.9540, lon: 82.6120, geosrc: "ул. Крылова, 39: координата приблизительная (Nominatim номер дома не нашёл)" },
  { id: "ukg", type: "branch", n: 3, name: tr("Усть-Каменогорский филиал по личному составу", "Өскемен филиалы (жеке құрам бойынша)", "Ust-Kamenogorsk branch (personnel records)"), city: "ukg",
    addr: tr("070003, г. Усть-Каменогорск, ул. Потанина, 12/2", "070003, Өскемен қ., Потанин көш., 12/2", "070003, Ust-Kamenogorsk, Potanin St., 12/2"),
    phones: ["8 (7232) 76-65-60", "8 (7232) 76-81-64"], email: null,
    hours: tr("пн–пт 9:00–18:00, обед 13:00–14:00", "Дс–Жм 9:00–18:00, түскі үзіліс 13:00–14:00", "Mon–Fri 9:00–18:00, lunch 13:00–14:00"),
    desc: tr("Документы по личному составу организаций и предприятий.", "Ұйымдар мен кәсіпорындардың жеке құрамы бойынша құжаттар.", "Personnel records of organisations and enterprises."),
    funds: tr("Документы по личному составу", "Жеке құрам бойынша құжаттар", "Personnel records"),
    lat: 49.9588961, lon: 82.5982159, geosrc: "Nominatim (OSM), запрос «Потанина 12/2, Усть-Каменогорск», здание way/47857211, 2026-11-09" },
  { id: "ridder", type: "branch", n: 4, name: tr("Риддерский филиал", "Риддер филиалы", "Ridder branch"), city: "rid",
    addr: tr("071300, г. Риддер, ул. Ч. Валиханова, 44", "071300, Риддер қ., Ш. Уәлиханов көш., 44", "071300, Ridder, Ch. Valikhanov St., 44"),
    phones: ["8 (72336) 42-264", "8 (72336) 45-786", "8 (72336) 42-645"], email: "priem.arhiv-ridder44@yandex.kz",
    hours: tr("пн–пт 9:00–18:00", "Дс–Жм 9:00–18:00", "Mon–Fri 9:00–18:00"),
    desc: tr("Документы города Риддера и предприятий горнодобывающего района.", "Риддер қаласы мен тау-кен ауданы кәсіпорындарының құжаттары.", "Documents of the town of Ridder and of enterprises of the mining district."),
    funds: tr("Ф. 412-Ф (Риддерское горное управление)", "Қ. 412-Ф (Риддер тау-кен басқармасы)", "Fonds 412-F (Ridder mining administration)"),
    lat: 50.3366507, lon: 83.4946810, geosrc: "Nominatim (OSM), запрос «улица Валиханова 44, Риддер», 2026-11-09: найдена улица, точка по улице (номер дома не определён)" },
  { id: "altai", type: "branch", n: 5, name: tr("Филиал Алтай (бывш. Зыряновский)", "Алтай филиалы (бұрынғы Зырян)", "Altai branch (former Zyryanovsk)"), city: "alt",
    addr: tr("070804, г. Алтай, ул. М. Горького, 33", "070804, Алтай қ., М. Горький көш., 33", "070804, Altai, M. Gorky St., 33"),
    phones: ["8 (72335) 31-260", "8 (72335) 62-888", "8 (72335) 63-016"], email: "arhiv.altai@yandex.kz",
    hours: tr("Приём директора: среда 9:00–18:00", "Директор қабылдауы: сәрсенбі 9:00–18:00", "Director's reception: Wednesday 9:00–18:00"),
    desc: tr("Документы Зыряновского района и города Алтай.", "Зырян ауданы мен Алтай қаласының құжаттары.", "Documents of the Zyryanovsk district and the town of Altai."),
    funds: tr("Фонды района и города", "Аудан мен қала қорлары", "District and town fonds"),
    lat: 49.7167, lon: 84.2667, geosrc: "Центр города Алтай (Зыряновск), общеизвестная координата: Nominatim по адресу не ответил" },
  { id: "zaisan", type: "branch", n: 6, name: tr("Зайсанский филиал", "Зайсан филиалы", "Zaisan branch"), city: "zai",
    addr: tr("070700, г. Зайсан, ул. Жангельдина, 52", "070700, Зайсан қ., Жангелдин көш., 52", "070700, Zaisan, Zhangeldin St., 52"),
    phones: ["8 (72340) 21-476", "8 (72340) 21-221"], email: "qosarhivzaysan_1@mail.ru",
    hours: tr("Уточняйте по телефону", "Телефон арқылы нақтылаңыз", "Please check by phone"),
    desc: tr("Документы Зайсанского района и уезда, планы и карты пограничной полосы.", "Зайсан ауданы мен уезінің құжаттары, шекара белдеуінің жоспарлары мен карталары.", "Documents of the Zaisan district, plans and maps of the border zone."),
    funds: tr("Ф. 205-К (карты и планы)", "Қ. 205-К (карталар мен жоспарлар)", "Fonds 205-K (maps and plans)"),
    lat: 47.4681575, lon: 84.8752510, geosrc: "Nominatim (OSM), запрос «Жангельдина 52, Зайсан», 2026-11-09: дом 52 на ул. Д. Кунаева (старое название — Жангельдина)" }
];

/* ---- хронология ---- */
window.EVENTS = [
  { y: "1718", th: ["town"], t: tr("Основание Семипалатинской крепости", "Семей бекінісінің негізі қаланды", "Founding of the Semipalatinsk fortress"), d: tr("Крепость на Иртыше возле руин буддийского монастыря с семью зданиями дала название будущему городу.", "Ертістегі жеті ғимаратты буддалық монастырь қирандылары жанындағы бекініс болашақ қалаға атау берді.", "A fortress on the Irtysh by the ruins of a monastery with seven buildings gave its name to the future city."), img: "semipalatinsk-1867.jpg", chips: [["14-Ф/1/7", "14-F/1/7"]] },
  { y: "1720", th: ["town"], t: tr("Основание Усть-Каменогорской крепости", "Өскемен бекінісінің негізі қаланды", "Founding of the Ust-Kamenogorsk fortress"), d: tr("Крепость при впадении Ульбы в Иртыш стала опорным пунктом освоения Рудного Алтая.", "Ұлба Ертіске құятын жерде салынған бекініс Кенді Алтайды игерудің тірек пункті болды.", "The fortress at the confluence of the Ulba and the Irtysh became a base for developing the Ore Altai."), img: "exile-1891.jpg", chips: [["14-Ф/1/52", "14-F/1/52"]] },
  { y: "1851", th: ["adm", "town"], t: tr("Утверждён герб Семипалатинска", "Семей қаласының елтаңбасы бекітілді", "Coat of arms of Semipalatinsk approved"), d: tr("Герб города утверждён 23 ноября 1851 года; дело сохранилось с рисунком и перепиской.", "Қала елтаңбасы 1851 жылғы 23 қарашада бекітілді; іс суреті мен хат-хабарымен сақталған.", "The city's coat of arms was approved on 23 November 1851; the file survives with the drawing and correspondence."), img: "winkler-1851.jpg", chips: [["Ф. 1-П, оп. 2, д. 18", "1-P/2/18"]] },
  { y: "1854", th: ["adm"], t: tr("Образована Семипалатинская область", "Семей облысы құрылды", "Semipalatinsk Region established"), d: tr("Управление областью сосредоточено в канцелярии военного губернатора; её фонд — основа каталога.", "Облысты басқару әскери губернатор кеңсесінде шоғырланды; оның қоры — каталогтың негізі.", "Administration of the region was concentrated in the chancellery of the military governor; its fonds is the core of the catalogue."), img: null, chips: [["Ф. 1-П", "1-P"]] },
  { y: "1885", th: ["cult", "town"], t: tr("Базары, переправы и аулы Прииртышья", "Ертіс өңірінің базарлары, өткелдері мен ауылдары", "Bazaars, ferries and auls of the Irtysh region"), d: tr("Фотографии 1885 года фиксируют торговую площадь, паромную переправу и быт кочевых хозяйств.", "1885 жылғы фотосуреттер сауда алаңын, паром өткелін және көшпелі шаруашылықтардың тұрмысын бейнелейді.", "Photographs of 1885 record the market square, the ferry crossing and the life of nomadic households."), img: "bazaar-1885.jpg", chips: [["14-Ф/1/28", "14-F/1/28"], ["14-Ф/1/31", "14-F/1/31"], ["14-Ф/1/44", "14-F/1/44"]] },
  { y: "1893", th: ["pop", "adm"], t: tr("Годовой обзор области", "Облыстың жылдық шолуы", "Annual survey of the region"), d: tr("Печатный обзор: территория, население, земледелие, торговля и школы пяти уездов.", "Баспа шолу: аумақ, халық, егіншілік, сауда және бес уездің мектептері.", "A printed survey: territory, population, farming, trade and schools of five districts."), img: "scan-1893.jpg", chips: [["Ф. 1-П, оп. 1, д. 245", "1-P/1/245"]] },
  { y: "1903", th: ["fam"], t: tr("Метрические книги: семья и поколения", "Метрикалық кітаптар: отбасы және ұрпақтар", "Parish registers: family and generations"), d: tr("Записи о рождениях, браках и смертях — главный источник для родословных.", "Туу, неке және өлім жазбалары — шежіре үшін басты дерек көзі.", "Entries of births, marriages and deaths are the main source for genealogies."), img: null, chips: [["Ф. 33-М, оп. 1, д. 412", "33-M/1/412"]] },
  { y: "1905", th: ["pop"], t: tr("Перепись населения области", "Облыс халқының санағы", "Population census of the region"), d: tr("Сведения о численности и составе населения по уездам и городам.", "Уездер мен қалалар бойынша халық саны мен құрамы туралы мәліметтер.", "Data on the size and composition of the population by district and town."), img: "scan-1905.jpg", chips: [["Ф. 1-П, оп. 1, д. 312", "1-P/1/312"]] },
  { y: "1913", th: ["ind"], t: tr("Отчёт Риддерского рудника", "Риддер кенішінің есебі", "Report of the Ridder mine"), d: tr("Добыча, число рабочих и производственные затраты рудника за год.", "Кеніштің жылдық өндірісі, жұмысшылар саны және өндірістік шығындары.", "Output, workforce and production costs of the mine for the year."), img: null, chips: [["Ф. 412-Ф, оп. 1, д. 15", "412-F/1/15"]] },
  { y: "1919", th: ["war", "adm"], t: tr("Гражданская война в крае", "Өлкедегі Азамат соғысы", "Civil War in the region"), d: tr("Кадры хроники: отряд всадников на улице города.", "Хроника кадрлары: қала көшесіндегі салт аттылар жасағы.", "Newsreel frames: a detachment of horsemen on a city street."), img: "alash-1919.jpg", chips: [["Ф. 71-Р, оп. 1, д. 9", "71-R/1/9"]] },
  { y: "1932", th: ["adm"], t: tr("Образована Восточно-Казахстанская область", "Шығыс Қазақстан облысы құрылды", "East Kazakhstan Region established"), d: tr("Областной центр — Усть-Каменогорск; начинается новый этап делопроизводства.", "Облыс орталығы — Өскемен; іс жүргізудің жаңа кезеңі басталады.", "The regional centre is Ust-Kamenogorsk; a new stage of record-keeping begins."), img: null, chips: [["Ф. 71-Р", "71-R"]] },
  { y: "1940", th: ["org"], t: tr("Основан Государственный архив ВКО", "ШҚО мемлекеттік архиві құрылды", "State Archive of East Kazakhstan founded"), d: tr("Архив принимает на хранение документы области и её филиалов.", "Архив облыс және оның филиалдары құжаттарын сақтауға қабылдайды.", "The archive takes custody of documents of the region and its branches."), img: null, chips: [["Об архиве", "about"]] },
  { y: "1941–1945", th: ["war"], t: tr("Край в годы Великой Отечественной войны", "Өлке Ұлы Отан соғысы жылдарында", "The region in the Great Patriotic War"), d: tr("Документы эвакуации, промышленности и мобилизации; база данных «Книга памяти» воинов.", "Көшіру, өнеркәсіп және жұмылдыру құжаттары; жауынгерлердің «Естелік кітабы» дерекқоры.", "Documents on evacuation, industry and mobilisation; the “Book of Memory” database of soldiers."), img: null, chips: [["Книга памяти", "kniga"]] }
];

window.HPLACES = [
  { id: "sem", t: tr("Семипалатинская крепость и город", "Семей бекінісі және қала", "Semipalatinsk fortress and town"), co: "≈ 50.41° N, 80.23° E", img: "semipalatinsk-1867.jpg", chips: [["14-Ф/1/7", "14-F/1/7"], ["1-П/2/18", "1-P/2/18"]], pos: "50% 50%" },
  { id: "bz", t: tr("Базарная площадь Семипалатинска", "Семейдегі Базар алаңы", "Bazaar Square of Semipalatinsk"), co: "≈ 50.41° N, 80.25° E", img: "bazaar-1885.jpg", chips: [["14-Ф/1/28", "14-F/1/28"]], pos: "50% 60%" },
  { id: "fer", t: tr("Паромная переправа через Иртыш", "Ертістегі паром өткелі", "Ferry crossing of the Irtysh"), co: "≈ 50.41° N, 80.27° E", img: "ferry-1885.jpg", chips: [["14-Ф/1/31", "14-F/1/31"]], pos: "50% 50%" },
  { id: "ukg", t: tr("Усть-Каменогорская крепость", "Өскемен бекінісі", "Ust-Kamenogorsk fortress"), co: "≈ 49.95° N, 82.62° E", img: "exile-1891.jpg", chips: [["14-Ф/1/52", "14-F/1/52"]], pos: "50% 60%" },
  { id: "lb", t: tr("Левый берег Иртыша", "Ертістің сол жағалауы", "Left bank of the Irtysh"), co: "≈ 50.40° N, 80.28° E", img: "semipalatinsk-1885.jpg", chips: [["14-Ф/1/12", "14-F/1/12"]], pos: "50% 60%" },
  { id: "aul", t: tr("Аулы Прииртышья", "Ертіс өңірінің ауылдары", "Auls of the Irtysh region"), co: "≈ 50.5° N, 80.1° E", img: "aul-1885.jpg", chips: [["14-Ф/1/44", "14-F/1/44"]], pos: "50% 55%" }
];

/* ---- выставка ---- */
window.EXPO = [
  { img: "semipalatinsk-1867.jpg", por: false, no: "14-Ф, оп. 1, д. 7", t: tr("Семипалатинск с Усть-Каменогорского выезда", "Өскемен жолы жағынан Семей", "Semipalatinsk from the Ust-Kamenogorsk road"), d: tr("Низкие дома, церковь и степная дорога: город 1860-х годов, вытянутый вдоль Иртыша.", "Аласа үйлер, шіркеу және дала жолы: Ертіс бойына созылған 1860-жылдардағы қала.", "Low houses, a church and a steppe road: the city of the 1860s, stretched along the Irtysh."), s: tr("1867. Wikimedia Commons, общественное достояние.", "1867. Wikimedia Commons, қоғамдық игілік.", "1867. Wikimedia Commons, public domain.") },
  { img: "winkler-1851.jpg", por: true, no: "1-П, оп. 2, д. 18", t: tr("Герб Семипалатинска", "Семей қаласының елтаңбасы", "Coat of arms of Semipalatinsk"), d: tr("Рисунок герба, утверждённого 23 ноября 1851 года. Дело хранит описание и переписку об утверждении.", "1851 жылғы 23 қарашада бекітілген елтаңба суреті. Істе сипаттама мен бекіту туралы хат-хабар сақталған.", "Drawing of the coat of arms approved on 23 November 1851. The file keeps the description and the correspondence."), s: tr("1851. Wikimedia Commons, общественное достояние.", "1851. Wikimedia Commons, қоғамдық игілік.", "1851. Wikimedia Commons, public domain.") },
  { img: "bazaar-1885.jpg", por: false, no: "14-Ф, оп. 1, д. 28", t: tr("Базар в Семипалатинске", "Семейдегі базар", "Bazaar in Semipalatinsk"), d: tr("Торговля у деревянных лавок: верблюды, телеги и горожане на Базарной площади.", "Ағаш дүкендер жанындағы сауда: Базар алаңындағы түйелер, арбалар және қала тұрғындары.", "Trade by wooden stalls: camels, carts and townspeople on the Bazaar Square."), s: tr("1885. Library of Congress, Wikimedia Commons, общественное достояние.", "1885. Library of Congress, Wikimedia Commons, қоғамдық игілік.", "1885. Library of Congress, Wikimedia Commons, public domain.") },
  { img: "ferry-1885.jpg", por: false, no: "14-Ф, оп. 1, д. 31", t: tr("Паромная переправа через Иртыш", "Ертістегі паром өткелі", "Ferry crossing of the Irtysh"), d: tr("Паром связывал берега реки, пока не было постоянного моста.", "Тұрақты көпір болмағанда паром өзен жағалауларын байланыстырды.", "A ferry joined the banks of the river before there was a permanent bridge."), s: tr("1885. Library of Congress, Wikimedia Commons, общественное достояние.", "1885. Library of Congress, Wikimedia Commons, қоғамдық игілік.", "1885. Library of Congress, Wikimedia Commons, public domain.") },
  { img: "aul-1885.jpg", por: false, no: "14-Ф, оп. 1, д. 44", t: tr("Аул близ Семипалатинска", "Семей маңындағы ауыл", "An aul near Semipalatinsk"), d: tr("Семья перед юртой: быт кочевых хозяйств в окрестностях города.", "Киіз үй алдындағы отбасы: қала маңындағы көшпелі шаруашылықтардың тұрмысы.", "A family in front of a yurt: life of nomadic households around the city."), s: tr("1885. Library of Congress, Wikimedia Commons, общественное достояние.", "1885. Library of Congress, Wikimedia Commons, қоғамдық игілік.", "1885. Library of Congress, Wikimedia Commons, public domain.") },
  { img: "exile-1891.jpg", por: false, no: "14-Ф, оп. 1, д. 52", t: tr("Усть-Каменогорск", "Өскемен", "Ust-Kamenogorsk"), d: tr("Гравюра 1891 года: город у слияния Иртыша и Ульбы.", "1891 жылғы гравюра: Ертіс пен Ұлба қосылатын жердегі қала.", "An engraving of 1891: the town at the confluence of the Irtysh and the Ulba."), s: tr("1891. Wikimedia Commons, общественное достояние.", "1891. Wikimedia Commons, қоғамдық игілік.", "1891. Wikimedia Commons, public domain.") },
  { img: "scan-1893.jpg", por: true, no: "1-П, оп. 1, д. 245", t: tr("Обзор Семипалатинской области за 1893 год", "1893 жылғы Семей облысына шолу", "Survey of Semipalatinsk Region for 1893"), d: tr("Печатный обзор области: границы, население, хозяйство и школы.", "Облыстың баспа шолуы: шекаралар, халық, шаруашылық және мектептер.", "A printed survey of the region: borders, population, economy and schools."), s: tr("1893. Wikimedia Commons, CC0.", "1893. Wikimedia Commons, CC0.", "1893. Wikimedia Commons, CC0.") }
];
window.EXPOS = [
  { img: "aul-1885.jpg", pos: "50% 55%", t: tr("Города, дороги и люди Прииртышья", "Ертіс өңірінің қалалары, жолдары мен адамдары", "Towns, roads and people of the Irtysh region"), d: tr("7 экспонатов · XIX век", "7 экспонат · XIX ғасыр", "7 exhibits · 19th century"), cur: true },
  { img: "scan-1905.jpg", pos: "50% 30%", t: tr("Перепись 1905 года: население области", "1905 жылғы санақ: облыс халқы", "Census of 1905: population of the region"), d: tr("12 экспонатов · 1905", "12 экспонат · 1905", "12 exhibits · 1905"), cur: false },
  { img: "alash-1919.jpg", pos: "50% 50%", t: tr("Край в 1919 году: хроника и документы", "1919 жылғы өлке: хроника және құжаттар", "The region in 1919: newsreel and documents"), d: tr("9 экспонатов · 1919 (черновик)", "9 экспонат · 1919 (жоба)", "9 exhibits · 1919 (draft)"), cur: false }
];
