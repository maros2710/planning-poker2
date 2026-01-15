# Repository Guidelines

## Struktura projektu a organizacia modulov
- Repozitar je zatial minimalny; neboli zistene ziadne ustalene adresare pre zdrojaky, testy ani assety. Pri pridavani struktury preferuj jasne rozdelenie, napr. `src/` pre aplikacny kod, `tests/` pre automatizovane testy a `assets/` pre staticke subory (obrazky, fixtures, atd.).
- Nove moduly udrzuj male a zamerane; ked funkcionalita prerastie niekolko suborov, vytvor podadresare podla funkcionality, nie podla typu suboru.

## Build, test a vyvojove prikazy
- Zatial nie su definovane build ani test skripty. Ked pridate tooling, zdokumentuj presne prikazy (napr. `npm run build`, `npm test` alebo `dotnet test`) a co kazdy prikaz robi.
- Ak projekt pouziva lokalny dev server, uved prikaz na jeho spustenie a potrebne premenne prostredia.

## Kodovaci styl a konvencie pomenovania
- Zatial nie je nakonfigurovany formatter ani linter. Ked ho zavediete (napr. Prettier, ESLint alebo editorconfig), pridaj prikaz na jeho pouzitie a vynucuj ho v CI, ak je k dispozicii.
- Pouzivaj konzistentne nazvy a casing v suboroch aj moduloch. Pre verejne API uprednostni popisne nazvy pred skratkami.

## Testovacie pokyny
- Zatial nie je nakonfigurovany ziadny testovaci framework. Ked testy pribudnu, zjednotte sa na jednom frameworku a popiste, ako spustit cely test suite aj cielene testy.
- Pouzivaj jasne nazvy testov, ktore popisuju spravanie a ocakavany vysledok.

## Commit a pull request pokyny
- Zatial nie su zavedene konvencie pre commit spravy. Pouzivaj kratke, pritomne tvary, ktore vysvetlia zmenu, a ak to dava zmysel, pridaj scope (napr. "Add API client for poker sessions").
- Pull requesty by mali obsahovat kratke zhrnutie, informaciu o testovani a relevantne screenshoty alebo logy pre UI ci behavior zmeny.

## Konfiguracia a tajomstva
- Necommitute tajomstva. Citliva konfiguracia patri do premennych prostredia alebo lokalnych konfiguracnych suborov, ktore nie su vo verziovacej kontrole.
- Ak pridate vzorovu konfiguraciu, pomenuj ju `*.example` a zdokumentuj postup kopirovania.
