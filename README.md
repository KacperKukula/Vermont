# Fala — prywatny odtwarzacz MP3

Monorepo **Turborepo**: Vue 3 + Vite + SCSS, NestJS na **Deno**, PostgreSQL i prywatny Cloudflare R2.

## Funkcje

- Rejestracja i logowanie; hasła hashowane scrypt, sesje w ciasteczkach HttpOnly.
- Prywatna biblioteka każdego użytkownika, wyszukiwanie w załadowanej liście i paginacja.
- Upload MP3 bezpośrednio do R2 z paskiem postępu, tytułem i drag & drop.
- Odtwarzanie, przewijanie, głośność i przejście do kolejnego nagrania.
- Usuwanie własnych nagrań z R2 i bazy.
- Endpoint MCP z narzędziami `list_recordings` oraz `get_playback_url`.

## Wymagania

- Deno 2.5.6 lub nowsze.
- Node.js 24+ oraz npm (repozytorium używa `packageManager: npm@12.1.0`). Node/npm służą do instalacji, Turborepo, kompilacji TypeScript i Vite. **Serwer działa na Deno**; Vue działa w przeglądarce.
- Docker Desktop z uruchomionym silnikiem Linux lub własny PostgreSQL.
- Bucket Cloudflare R2 i klucz API z prawami odczytu/zapisu tylko do tego bucketa.

NestJS jest kompilowany przez `tsc`, aby zachować metadane dekoratorów wymagane przez dependency injection. Deno uruchamia wynikowy ESM. Jeden workspace i jeden lockfile npm są źródłem prawdy — nie instaluj zależności równolegle przez `deno install`.

## Uruchomienie lokalne

Polecenia wykonuj w katalogu głównym. W PowerShell, jeżeli polityka blokuje `npm.ps1`, użyj `npm.cmd` zamiast `npm`.

```powershell
npm install
Copy-Item .env.example .env
docker compose -f infra/compose.yaml up -d
```

Uzupełnij w `.env` prawdziwe dane R2:

```dotenv
R2_ENDPOINT=https://TWOJE_ACCOUNT_ID.r2.cloudflarestorage.com
R2_BUCKET=people-mp3
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
```

W Cloudflare: **R2 → bucket → Settings → CORS policy** wklej zawartość `infra/r2-cors.json`. Zostaw bucket prywatny, bez `r2.dev` i bez publicznej domeny. CORS musi dopuszczać nagłówki `Content-Type` i `If-None-Match`.

```powershell
npm run db:migrate
npm run dev
```

- Panel: **http://localhost:5173** — używaj dokładnie tej domeny, nie `127.0.0.1`, ze względu na kontrolę Origin.
- API: http://localhost:3000/api
- Sprawdzenie bazy: http://localhost:3000/api/health
- MCP: http://localhost:3000/mcp

Możesz również użyć `deno task dev`, `deno task build`, `deno task check`, `deno task test` i `deno task db:migrate`. To skróty wywołujące zadania npm/Turborepo, nie alternatywny system instalacji zależności.

Po pierwszym uruchomieniu wybierz **Zarejestruj się**, utwórz konto i wgraj MP3. Domyślny limit jednego pliku to 100 MiB (`MAX_UPLOAD_BYTES`).

## Struktura

```text
apps/client/           Vue, Vite, SCSS
  src/
    App.vue            tylko RouterView — wejście do drzewa widoków
    main.ts            rejestracja Vue Router i montowanie aplikacji
    router/            trasy, ochrona sesji i testy nawigacji
    layouts/           wspólny AppLayout z nagłówkiem i odtwarzaczem
    views/             Login, Register, Library, Integrations, NotFound
    components/        auth, layout, recordings, player, integrations
    composables/       sesja, biblioteka, upload, odtwarzacz, komunikaty
    services/          transport HTTP i osobne serwisy API
    utils/             formatowanie dat i rozmiarów
apps/server/           NestJS, REST i MCP, runtime Deno
  src/
    main.ts            uruchomienie aplikacji i middleware
    app.module.ts      moduł główny — łączy moduły funkcjonalne
    app.controller.ts  GET / oraz GET /api/health
    app.service.ts     informacje o aplikacji i sprawdzenie bazy
    auth/              auth.module.ts, auth.controller.ts, auth.service.ts, session.guard.ts
    recordings/        recordings.module.ts, recordings.controller.ts, recordings.service.ts
    mcp/               mcp.module.ts, mcp.controller.ts, mcp.service.ts
    database/          database.module.ts, database.service.ts
    storage/           storage.module.ts, storage.service.ts
  migrations/          wersjonowane migracje SQL
  scripts/migrate.ts   migrator z transakcjami i blokadą PostgreSQL
  test/                testy uruchamiane przez Deno
packages/contracts/    wspólne typy i schematy Zod, bez kodu serwerowego
infra/                 PostgreSQL Compose i przykład CORS R2
```

Nie potrzeba teraz workera ani osobnego serwera MCP. Dostęp do bazy wykorzystuje `pg` i parametryzowane SQL — celowo bez dodatkowego ORM dla kilku prostych tabel.

### Konwencje NestJS

- `*.controller.ts` — endpointy HTTP, walidacja wejścia i odpowiedzi; bez zapytań SQL.
- `*.service.ts` — logika aplikacji oraz dostęp do bazy lub integracji.
- `*.module.ts` — deklaruje kontrolery i serwisy, importuje zależności oraz eksportuje serwisy potrzebne innym modułom.
- `session.guard.ts` — sprawdza sesję przed wykonaniem chronionego endpointu.

`DatabaseModule` i `StorageModule` nie mają kontrolerów: są wewnętrznymi integracjami, a nie osobnymi publicznymi API. `main.ts` tylko uruchamia `AppModule` i konfiguruje HTTP. Importy z końcówką `.js` wskazują wynik kompilacji TypeScript do ESM dla Deno.

### Konwencje Vue i routing

- `App.vue` zawiera wyłącznie `RouterView`. Wspólna otoczka jest w `layouts/AppLayout.vue`.
- `views/` składa strony z komponentów. Komponenty listy otrzymują dane przez props i zgłaszają akcje przez emits.
- `composables/` zarządza stanem i operacjami; `services/` zna adresy endpointów API.
- Stan sesji, odtwarzacza i powiadomień jest współdzielony. Lista nagrań i formularze mają stan lokalny; token MCP znika po opuszczeniu strony integracji.
- Odtwarzacz znajduje się poza widokiem strony, więc zmiana Biblioteka → Integracje nie przerywa odtwarzania.

Trasy Vue Router (history mode):

| Ścieżka | Strona | Dostęp |
| --- | --- | --- |
| `/` | Przekierowanie do biblioteki | Gość trafia do logowania |
| `/login` | Logowanie | Gość |
| `/register` | Rejestracja | Gość |
| `/library` | Biblioteka i upload MP3 | Zalogowany użytkownik |
| `/integrations` | Token MCP | Zalogowany użytkownik |
| pozostałe | Strona 404 | Wszyscy |

Router odtwarza sesję przed wejściem na chronioną stronę, zachowuje docelowy adres przy logowaniu i blokuje zmianę strony podczas uploadu. Kontrola w routerze służy wygodzie użytkownika — backend nadal samodzielnie sprawdza sesję i własność nagrań.

## Sprawdzanie kodu

```powershell
npm run build
npm run check
npm run test
```

Testy jednostkowe nie wymagają danych Cloudflare ani uruchomionej bazy. Nie zastępują testu integracyjnego z prawdziwym R2 i PostgreSQL.

## Jak działa upload

1. Zalogowany użytkownik otrzymuje podpisany URL PUT ważny 10 minut.
2. Przeglądarka wysyła MP3 do R2 z `Content-Type: audio/mpeg` i `If-None-Match: *` (zakaz nadpisania).
3. Backend sprawdza rozmiar, Content-Type i początkowe bajty obiektu, następnie oznacza nagranie jako gotowe.
4. Odtwarzacz dostaje podpisany URL GET ważny godzinę, z obsługą Range przez R2.

W bazie przechowywany jest klucz obiektu, nie podpisany URL. Link umożliwia dostęp każdemu, kto go zna, do czasu wygaśnięcia. Sprawdzenie sygnatury MP3 jest podstawowe — nie jest pełną walidacją dekoderem ani skanerem bezpieczeństwa.

## MCP i ChatGPT

W panelu wejdź na stronę **Integracje** (`/integrations`) i wygeneruj token. Nowy token unieważnia poprzedni. W bazie przechowywany jest tylko SHA-256 tokenu. Możesz go odwołać na tej samej stronie.

Serwer obsługuje bezstanowy **Streamable HTTP**, `POST /mcp`, z nagłówkiem:

```http
Authorization: Bearer TWOJ_TOKEN
```

Narzędzia widzą wyłącznie nagrania właściciela tokenu. `list_recordings` obsługuje `offset`; `get_playback_url` przyjmuje `recordingId`. Nie ma transkrypcji ani analizy dźwięku.

**To nie jest jeszcze gotowa, autoryzowana integracja z kontami ChatGPT.** Obecny mechanizm to ręczny token Bearer dla klientów MCP obsługujących własny nagłówek Authorization. Dla standardowego zdalnego połączenia ChatGPT należy wdrożyć serwer pod publicznym HTTPS i skonfigurować zgodną autoryzację OAuth (np. z zewnętrznym dostawcą tożsamości). Projekt nie implementuje jeszcze serwera OAuth ani jego metadanych. Nie wyłączaj ochrony MCP w celu podłączenia ChatGPT.

## Wdrożenie

- Frontend: opublikuj `apps/client/dist` na hostingu statycznym; przekieruj `/api/*` do NestJS, zachowując nagłówek Origin. Vite proxy działa tylko w development. Dla tras Vue Router skonfiguruj **SPA fallback do `/index.html`**, aby odświeżenie `/library` lub `/integrations` działało. Nie stosuj tego fallbacku do API, `/mcp` ani plików statycznych.
- Backend: `npm run build`, następnie `npm run start -w @people/server` z uzupełnionym `.env`. Alternatywnie Docker z katalogu głównego:

  ```powershell
  docker build -f apps/server/Dockerfile -t fala-server .
  docker run --env-file .env -p 3000:3000 fala-server
  ```

  W kontenerze `DATABASE_URL` musi wskazywać osiągalny serwer PostgreSQL, nie `localhost` hosta.
- Ustaw `CLIENT_ORIGIN` na dokładny adres HTTPS panelu (bez końcowego ukośnika), `COOKIE_SECURE=true` oraz produkcyjny CORS bucketa.
- Migracje wykonuj przed startem nowej wersji. Nie są automatycznie uruchamiane przy starcie serwera.
- Zapewnij HTTPS, kopie zapasowe PostgreSQL i ochronę sekretów. Przykładowe hasło Compose służy tylko lokalnie.

### Ograniczenia przed publicznym udostępnieniem

To mała wersja startowa, nie kompletny publiczny hosting plików:

- Brak potwierdzania e-maili, resetowania haseł, limitu łącznej przestrzeni i panelu administratora.
- Limit rozmiaru jest sprawdzany przed wydaniem URL i po uploadzie; podpisany PUT nie jest twardym limitem przesyłanych bajtów w R2. Dla niezaufanych użytkowników dodaj limity przestrzeni i mechanizm egzekwujący rozmiar podczas przesyłania.
- Przerwanie karty podczas uploadu może zostawić rekord `pending` i osierocony obiekt. Przed publicznym wdrożeniem dodaj cykliczne sprzątanie rekordów i obiektów starszych niż czas ważności uploadu.
- Rate limiting jest lokalny dla pojedynczego procesu. Przy wielu instancjach potrzebuje współdzielonego magazynu; zaufanie do reverse proxy wymaga dopasowania do konkretnego hostingu.
- Konta i nagrania są prywatne; udostępnianie innym użytkownikom nie jest zaimplementowane.
