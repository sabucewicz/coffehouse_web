# Kawonia — strona wizytówkowa

Statyczna strona kawiarni florystycznej **Kawonia** (Mysłowice). Czysty HTML, CSS i niewielki vanilla JS — działa bez budowania na GitHub Pages i Netlify.

## Uruchomienie lokalne

1. Otwórz folder projektu w terminalu.
2. Uruchom prosty serwer HTTP (ważne przy testowaniu ścieżek; nie otwieraj plików przez `file://` jeśli nie musisz):

```bash
# Python 3
python -m http.server 8080

# albo Node (npx)
npx --yes serve -p 8080
```

3. Wejdź na [http://localhost:8080](http://localhost:8080).

Struktura podstron: `/`, `/kwiaciarnia/`, `/kawiarnia/`, `/galeria/`, `/kontakt/`, `/rezerwacja/`.

## Wdrożenie na GitHub Pages

1. Wrzuć projekt do repozytorium GitHub.
2. **Settings → Pages → Build and deployment**: Source = *Deploy from a branch*.
3. Branch: `main` (lub `gh-pages`), folder: `/ (root)`.
4. Po kilku minutach strona będzie pod adresem:
   `https://<user>.github.io/<nazwa-repo>/`
5. Wszystkie ścieżki w projekcie są **względne**, więc strona działa zarówno pod root domeny, jak i pod ścieżką z nazwą repozytorium.

## Wdrożenie na Netlify

1. Zaloguj się na [Netlify](https://www.netlify.com/) i wybierz *Add new site → Import an existing project* (połącz repo) albo przeciągnij folder (*Deploy manually*).
2. Build settings:
   - **Build command**: *(puste)*
   - **Publish directory**: `.` (root projektu)
3. Deploy. Netlify nada adres `*.netlify.app`; domenę własną dodasz w *Domain management*.

## Podmiana zdjęć

Folder `images/` zawiera lokalne zaślepki SVG w kolorach marki. Nic nie jest pobierane z internetu.

**Opcja A — ta sama nazwa pliku**

1. Przygotuj zdjęcie (najlepiej WebP, ewentualnie JPEG/PNG).
2. Nadaj mu **tę samą nazwę** co zaślepka, np. `gallery-1.webp` → wtedy zmień też rozszerzenie w HTML, albo zapisz jako `gallery-1.svg` tylko jeśli to nadal SVG.
3. Najprościej: zapisz jako `gallery-1.webp` i w odpowiednim `index.html` zmień `src` z `.svg` na `.webp`.

**Opcja B — nowa nazwa**

Zmień atrybut `src` w HTML na nową ścieżkę względną, np. `images/hero-real.webp`. Zachowaj `alt`, `width`, `height` oraz `loading="lazy"` poza pierwszym ekranem.

**Kompresja (zalecenia)**

- Docelowa szerokość: ok. 1200–1600 px dla hero, 800–1000 px dla galerii.
- Format: **WebP** (dobry stosunek jakość/rozmiar).
- Narzędzia: [Squoosh](https://squoosh.app/), `cwebp`, ImageMagick, Sharp.
- Cel: zwykle poniżej 150–200 KB na zdjęcie; hero do ~300 KB.
- Po podmianie sprawdź, czy wymiary `width`/`height` w HTML odpowiadają proporcjom (żeby nie było skoku układu).

**Logo**

- `images/logo.svg` — wersja na beżowym tle (zielony kwiat).
- `images/logo-light.svg` — wersja na zielonym tle (beżowy kwiat).
- Docelowo podmień na logo od klientki (najlepiej SVG lub PNG z przezroczystością).

## Podmiana menu i cen

Treści oferty są **wpisane w HTML** (indeksowane przez wyszukiwarki), nie w JS.

| Strona | Plik | Co edytować |
|--------|------|-------------|
| Kawiarnia | `kawiarnia/index.html` | listy `.price-list` (Kawa, Na słodko) |
| Kwiaciarnia | `kwiaciarnia/index.html` | lista oferty i ceny |
| Godziny | `kontakt/index.html` (+ JSON-LD w `<head>`) | lista godzin |
| Opisy | wszystkie `index.html` | akapity oznaczone komentarzem `TODO` |

## Formularz rezerwacji

W `js/main.js` na górze:

```js
const FORM_ENDPOINT = "";
```

Gdy stała jest pusta, formularz pokazuje komunikat o wersji testowej (nic nie wychodzi na serwer).

**Docelowo:** podłącz konto Google kawiarni (Formularze Google lub Apps Script) i wklej URL do `FORM_ENDPOINT`. Upewnij się, że nazwy pól w formularzu HTML odpowiadają polom w Google Forms / skrypcie.

## Podpięcie własnej domeny

1. Kup / wskaż domenę u rejestratora.
2. **GitHub Pages**: Settings → Pages → Custom domain; dodaj rekordy DNS (A / CNAME) wg instrukcji GitHub.
3. **Netlify**: Domain management → Add custom domain; ustaw DNS (często CNAME na `*.netlify.app` albo rekordy Netlify DNS).
4. Włącz HTTPS (GitHub/Netlify robią to automatycznie po weryfikacji DNS).

Po podpięciu domeny zaktualizuj `canonical`, Open Graph, `sitemap.xml` i JSON-LD (zamień `https://www.example.com`).

## Lista rzeczy przed publikacją

- [ ] Usunąć `<meta name="robots" content="noindex">` z każdej podstrony (oraz komentarz TODO przy nim).
- [ ] W `robots.txt` usunąć `Disallow: /` (albo zmienić na `Allow: /`) i poprawić URL sitemapy.
- [ ] Wpisać prawdziwą domenę w: `link rel="canonical"`, meta `og:url` / `og:image`, `sitemap.xml`, JSON-LD (`url`).
- [ ] Podmienić zdjęcia i logo.
- [ ] Potwierdzić z klientką: menu, ceny, godziny, opisy (wszystkie miejsca z `TODO`).
- [ ] Wkleić iframe mapy Google na stronie Kontakt.
- [ ] Ustawić `FORM_ENDPOINT` w `js/main.js` i przetestować wysyłkę.
- [ ] Sprawdzić Lighthouse (Performance, Accessibility, Best Practices, SEO) — cel 95+.

## Struktura plików

```
index.html
kwiaciarnia/index.html
kawiarnia/index.html
galeria/index.html
kontakt/index.html
rezerwacja/index.html
css/styles.css
js/main.js
images/          # logo, zaślepki SVG
fonts/           # Barlow woff2 (lokalnie)
favicon.svg
robots.txt
sitemap.xml
README.md
```

## Kolory i motywy

- Zielony: `#044838`
- Beżowy: `#f4ece2`
- Motyw przez klasę na `body`: `theme-beige` lub `theme-green` (bez JS).

## Czcionka

Barlow (400–800) hostowana lokalnie w `fonts/` przez `@font-face` z `font-display: swap`. Zapas: `system-ui`.
