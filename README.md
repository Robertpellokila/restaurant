# Vue Project

Aplikasi Vue 3 dengan Vuex 4 sebagai pengelola state dan Axios sebagai HTTP client untuk Firebase Realtime Database.

## Menjalankan aplikasi

```sh
npm install
npm run dev
```

URL Firebase sudah dikonfigurasi ke database proyek. Untuk menggantinya, salin `.env.example` ke `.env.local`, ubah `VITE_FIREBASE_DATABASE_URL`, lalu jalankan ulang Vite.

```sh
npm test
npm run build
```

## Alur data

Komponen → action/mutation Vuex → layanan Axios → Firebase. State produk, resep, filter, detail resep, pagination testimoni, keranjang, dan menu berada di Vuex. Komponen tidak memanggil HTTP langsung.

| Data | Endpoint REST |
| --- | --- |
| Produk | `/products.json` |
| Detail produk | `/products/{id}.json` |
| Resep | `/recipes.json` |
| Detail resep | `/recipes/{id}.json` |
| Testimoni | `/testimonials.json` |

Endpoint menggunakan akhiran `.json` sesuai [dokumentasi REST Firebase](https://firebase.google.com/docs/database/rest/start). Respons koleksi dapat berupa objek dengan key Firebase, array, atau `null`. Key Firebase dijadikan ID string agar detail dan operasi keranjang memakai identitas yang sama.

Produk mengikuti struktur Firebase pengguna: `id`, `name`, `category`, `imageUrl`, `price`, dan `stock`. `name` ditampilkan sebagai judul, `imageUrl` sebagai gambar, dan `price` sebagai rupiah (misalnya `95000` menjadi `Rp95.000`). Stok ditampilkan dan jumlah di keranjang dibatasi berdasarkan stok yang dimuat. Produk tanpa `rating` tidak menampilkan bintang kosong. Format lama `title`/`thumbnail` tetap didukung.

Resep memakai `name`, `imageUrl`, `category`, `description`, `time` (menit), `servings`, `difficulty`, `rating`, `ingredients`, dan `steps`. Format lama `image`, `mealType`, `prepTimeMinutes`, `cookTimeMinutes`, dan `instructions` juga didukung.

Pencarian dan pagination dilakukan melalui getter Vuex setelah koleksi dibaca, karena endpoint pencarian dan parameter `limit`/`skip` dari API lama bukan endpoint Firebase. Koleksi disimpan dalam state selama sesi; action `fetchProducts`, `fetchRecipes`, dan `fetchTestimonials` menerima `{ force: true }` untuk memuat ulang. Cara ini cocok untuk katalog kecil; katalog besar memerlukan query dan pagination Firebase di server.

Keranjang dikelola modul Vuex `cart` dan dipertahankan di `localStorage` dengan key `vue-project-cart`. Keranjang belum disinkronkan antar perangkat. Batas stok adalah validasi lokal berdasarkan data yang dimuat, bukan reservasi atau pengurangan stok Firebase. Aplikasi tidak memiliki login atau endpoint penulisan data.

## Menyiapkan Firebase

Saat integrasi diperiksa, pembacaan `products`, `recipes`, dan `testimonials` mengembalikan HTTP 401 (`Permission denied`). Kode aplikasi menampilkan pesan gagal dan tombol coba lagi; data baru akan tampil setelah akses baca koleksi tersebut tersedia.

1. Buka Firebase Console → Realtime Database untuk proyek `vue-project-7c5c3`.
2. Pertahankan node `products` yang sudah ada. Impor `firebase/recipes.json` ke node `/recipes` dan `firebase/testimonials.json` ke node `/testimonials`. Ada 8 resep dan 15 testimoni contoh; lihat [panduan impor](firebase/README.md) untuk langkah lengkap.
3. Untuk katalog yang memang ditujukan bagi pengunjung publik, gunakan `firebase/database.rules.example.json` sebagai contoh aturan baca. Contoh tersebut hanya membuka pembacaan tiga koleksi katalog dan menolak penulisan dari aplikasi. Gabungkan aturan dengan aturan proyek yang sudah ada sesuai kebutuhan; file contoh tidak diterapkan otomatis.
4. Jika data memerlukan autentikasi, pertahankan aturan privat dan integrasikan Firebase Authentication sebelum mengaksesnya. URL database saja tidak memberikan izin akses. Jangan menyimpan database secret atau kredensial admin pada variabel `VITE_*` karena nilainya masuk ke bundle browser.

Data contoh tidak diunggah otomatis. Impor file ke node masing-masing, bukan ke root atau ke dalam `products`. `firebase/database.example.json` hanya contoh gabungan; bagian produknya hanya berisi `prod_01` yang terlihat pada screenshot, bukan salinan seluruh produk pengguna. Jangan mengimpor contoh gabungan ke database pengguna yang sudah berisi produk lain.

Nama, isi, likes testimoni, serta rating resep adalah data contoh buatan untuk demo. Semua testimoni memiliki `isSample: true` dan ditandai **Contoh testimoni** di aplikasi. Gambar resep adalah ilustrasi, bukan foto hasil memasak resep tersebut.

## Pengujian

`npm test` memakai test runner bawaan Node.js dan adapter Axios simulasi. Pengujian mencakup respons Firebase dengan key string/array/null, detail yang tidak ditemukan, pencarian, pagination, penanganan penolakan akses dan retry, serta tambah/ubah/hapus/persistensi keranjang. Pengujian tidak menulis data ke Firebase.
