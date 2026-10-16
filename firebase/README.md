# Data siap impor ke Firebase

Aplikasi menggunakan tiga node sejajar: `products`, `recipes`, dan `testimonials`. Gunakan nama jamak tersebut, bukan `recipe` atau `testimonial`.

```text
root
├── products            ← produk Anda tetap di sini
│   ├── prod_01
│   ├── prod_02
│   └── ...
├── recipes
│   ├── recipe_01
│   └── ... recipe_08
└── testimonials
    ├── testi_01
    └── ... testi_15
```

## File yang dipakai

| File | Pilih lokasi ini sebelum impor | Isi |
| --- | --- | --- |
| [recipes.json](recipes.json) | `/recipes` | 8 resep lengkap dengan bahan, langkah, waktu, porsi, dan gambar ilustrasi |
| [testimonials.json](testimonials.json) | `/testimonials` | 15 testimoni contoh, tampil dalam 2 halaman |

## Cara mengimpor

1. Buka Firebase Console → **Realtime Database** → tab **Data**.
2. Tambahkan node bernama `recipes` sejajar dengan `products` jika belum ada. Anda bisa memberi nilai sementara `true` agar node tersimpan.
3. Klik node `recipes`. Pastikan lokasi yang dipilih adalah `/recipes`.
4. Klik menu **⋮ → Import JSON**, pilih file `recipes.json` dari folder ini, lalu **Import**.
5. Ulangi langkah yang sama untuk node `testimonials`, menggunakan file `testimonials.json`.
6. Muat ulang aplikasi setelah selesai agar Vuex mengambil data terbaru.

Firebase menyediakan impor JSON pada node yang dipilih; lihat [panduan resmi Firebase](https://firebase.google.com/docs/database/manage-data-console?hl=id). File-file ini berisi isi node secara langsung, jadi jangan menambahkan pembungkus `recipes` atau `testimonials` lagi. Anda juga bisa membuka file dan menyalin isi JSON-nya untuk disimpan sebagai file `.json` sendiri.

Impor mengganti isi lokasi yang dipilih. Pilih `/recipes` dan `/testimonials` masing-masing agar data produk tetap terjaga. Jika node tujuan sudah berisi data yang ingin disimpan, gabungkan data tersebut dengan file ini terlebih dahulu.

## Bentuk produk yang sudah didukung

```json
{
  "prod_01": {
    "id": "prod_01",
    "name": "Buku Pemrograman Vue.js",
    "category": "Buku",
    "imageUrl": "https://picsum.photos/200/200?random=1",
    "price": 95000,
    "stock": 15
  }
}
```

Produk Anda tidak perlu diubah ke `title` atau `thumbnail`. Aplikasi memetakan field tersebut, menampilkan harga rupiah, dan membaca `stock`. Harga dan stok di Firebase harus berupa angka, bukan teks berawalan `Rp`.

## Data contoh dan izin baca

Seluruh testimoni merupakan data fiktif untuk demo, dengan `isSample: true` agar tampil berlabel **Contoh testimoni**. Ganti dengan ulasan asli bila diperlukan. Rating resep dan likes testimoni juga merupakan angka contoh. Gambar resep adalah ilustrasi dan dapat diganti lewat `imageUrl`.

`database.example.json` adalah referensi struktur gabungan. Produk di sana hanya `prod_01` dari screenshot; detail `prod_02` dan seterusnya tidak tersedia. File gabungan bukan untuk diimpor ke root database yang sudah berisi produk Anda.

Jika muncul `Permission denied`, sesuaikan tab **Rules**. `database.rules.example.json` menyediakan contoh akses baca publik hanya untuk tiga node katalog dengan penulisan dari aplikasi tetap ditolak. Gunakan sesuai kebutuhan akses proyek Anda. Tidak ada data maupun rules yang dipublikasikan otomatis oleh aplikasi.
