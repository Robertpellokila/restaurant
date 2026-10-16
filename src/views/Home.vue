<script setup>
import { computed, onMounted } from "vue";
import { useStore } from "vuex";
import ProductCard from "../components/ProductCard.vue";

const store = useStore();
const products = computed(() => store.getters["products/allProducts"] ?? []);
const recipes = computed(() => store.getters["recipes/allRecipes"] ?? []);
const productsLoading = computed(() => store.getters["products/isLoading"]);
const recipesLoading = computed(() => store.getters["recipes/isLoading"]);
const productsError = computed(() => store.getters["products/getError"]);
const recipesError = computed(() => store.getters["recipes/getError"]);
const featuredProducts = computed(() => products.value.slice(0, 4));
const featuredRecipes = computed(() => recipes.value.slice(0, 3));

async function loadData() {
    const tasks = [];
    if (!products.value.length)
        tasks.push(store.dispatch("products/fetchProducts"));
    if (!recipes.value.length)
        tasks.push(store.dispatch("recipes/fetchRecipes"));
    await Promise.allSettled(tasks);
}

onMounted(loadData);
</script>

<template>
    <main class="home-page">
        <section class="hero shell">
            <div class="hero-copy">
                <span class="eyebrow"
                    ><span class="eyebrow-dot"></span> WELCOME TO OUR
                    COLLECTION</span
                >
                <h1>Temukan inspirasi untuk <span>setiap harimu.</span></h1>
                <p>
                    Jelajahi pilihan produk menarik dan resep masakan yang bisa
                    kamu coba. Semua dalam satu tempat yang praktis.
                </p>
                <div class="hero-actions">
                    <RouterLink class="button button-primary" to="/product"
                        >Jelajahi Produk
                        <span aria-hidden="true">→</span></RouterLink
                    >
                    <RouterLink class="button button-outline" to="/recipe"
                        >Lihat Resep</RouterLink
                    >
                </div>
                <div class="hero-highlights">
                    <div>
                        <strong>{{ products.length }}</strong
                        ><span>Produk tersedia</span>
                    </div>
                    <span class="separator" aria-hidden="true"></span>
                    <div>
                        <strong>{{ recipes.length }}</strong
                        ><span>Inspirasi resep</span>
                    </div>
                </div>
            </div>
            <div class="hero-visual">
                <img
                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1100&auto=format&fit=crop"
                    alt="Beragam bahan makanan segar"
                />
                <div class="hero-floating">
                    <span class="floating-icon">✦</span>
                    <div>
                        <strong>Discover & Explore</strong
                        ><small>Inspirasi pilihan untukmu</small>
                    </div>
                </div>
            </div>
        </section>

        <section
            class="section section-soft"
            aria-labelledby="products-heading"
        >
            <div class="shell">
                <div class="section-heading">
                    <div>
                        <span class="eyebrow">PILIHAN UNTUKMU</span>
                        <h2 id="products-heading">Produk Pilihan</h2>
                        <p>Temukan produk favorit dari koleksi kami.</p>
                    </div>
                    <RouterLink to="/product" class="view-all"
                        >Lihat semua produk
                        <span aria-hidden="true">→</span></RouterLink
                    >
                </div>
                <div
                    v-if="productsLoading && !products.length"
                    class="message"
                    role="status"
                >
                    Memuat produk pilihan...
                </div>
                <div
                    v-else-if="productsError && !products.length"
                    class="message error"
                    role="alert"
                >
                    {{ productsError }}
                    <button @click="loadData">Coba lagi</button>
                </div>
                <div v-else-if="featuredProducts.length" class="product-grid">
                    <ProductCard
                        v-for="product in featuredProducts"
                        :key="product.id"
                        :product="product"
                    />
                </div>
                <div v-else class="message">Produk belum tersedia.</div>
            </div>
        </section>

        <section class="section shell" aria-labelledby="recipes-heading">
            <div class="section-heading">
                <div>
                    <span class="eyebrow">IDE MASAK HARI INI</span>
                    <h2 id="recipes-heading">Inspirasi Resep</h2>
                    <p>Cari ide masakan sederhana untuk dicoba hari ini.</p>
                </div>
                <RouterLink to="/recipe" class="view-all"
                    >Jelajahi resep
                    <span aria-hidden="true">→</span></RouterLink
                >
            </div>
            <div
                v-if="recipesLoading && !recipes.length"
                class="message"
                role="status"
            >
                Memuat resep...
            </div>
            <div
                v-else-if="recipesError && !recipes.length"
                class="message error"
                role="alert"
            >
                {{ recipesError }} <button @click="loadData">Coba lagi</button>
            </div>
            <div v-else-if="featuredRecipes.length" class="recipe-grid">
                <article
                    v-for="recipe in featuredRecipes"
                    :key="recipe.id"
                    class="recipe-card"
                >
                    <div class="recipe-image">
                        <img
                            :src="recipe.image"
                            :alt="recipe.name"
                            loading="lazy"
                        /><span class="category">{{ recipe.category }}</span>
                    </div>
                    <div class="recipe-body">
                        <div class="meta">
                            <span>◷ {{ recipe.time }} menit</span
                            ><span>★ {{ recipe.rating }}</span>
                        </div>
                        <h3>{{ recipe.name }}</h3>
                        <p>{{ recipe.description }}</p>
                        <RouterLink to="/recipe" class="recipe-link"
                            >Lihat resep
                            <span aria-hidden="true">→</span></RouterLink
                        >
                    </div>
                </article>
            </div>
            <div v-else class="message">Resep belum tersedia.</div>
        </section>
        <section class="cta shell">
            <div>
                <span class="eyebrow">READY TO EXPLORE?</span>
                <h2>Mulai temukan favoritmu.</h2>
                <p>Lihat katalog lengkap dan temukan lebih banyak pilihan.</p>
            </div>
            <RouterLink class="button button-primary" to="/product"
                >Mulai Jelajah →</RouterLink
            >
        </section>
    </main>
</template>

<style scoped>
.home-page {
    color: var(--text-color, #1f2937);
    background: var(--background-color, #fff);
    min-height: 100vh;
}
.shell {
    width: min(1200px, calc(100% - 48px));
    margin-inline: auto;
}
.hero {
    display: grid;
    grid-template-columns: 1.06fr 0.94fr;
    gap: clamp(32px, 6vw, 80px);
    align-items: center;
    padding-block: 70px 84px;
}
.eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1.9px;
    color: var(--accent-color, #2563eb);
}
.eyebrow-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent-color, #2563eb);
}
.hero h1 {
    max-width: 620px;
    margin: 18px 0;
    font-size: clamp(37px, 5.5vw, 66px);
    font-weight: 800;
    line-height: 1.14;
    letter-spacing: -2px;
}
.hero h1 span {
    color: var(--accent-color, #2563eb);
}
.hero-copy > p {
    max-width: 525px;
    color: var(--muted-color, #64748b);
    line-height: 1.85;
    font-size: 16px;
}
.hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 29px;
}
.button {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    padding: 14px 22px;
    border-radius: 10px;
    font-weight: 700;
    font-size: 14px;
    text-decoration: none;
    transition:
        transform 0.2s,
        opacity 0.2s;
}
.button:hover {
    transform: translateY(-2px);
    opacity: 0.9;
}
.button-primary {
    background: var(--accent-color, #2563eb);
    color: #fff;
}
.button-outline {
    border: 1px solid #d5dae2;
    color: var(--text-color, #1f2937);
    background: #fff;
}
.hero-highlights {
    display: flex;
    gap: 25px;
    align-items: center;
    margin-top: 44px;
}
.hero-highlights > div {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.hero-highlights strong {
    font-size: 25px;
    line-height: 1;
}
.hero-highlights div span {
    font-size: 12px;
    color: #64748b;
}
.separator {
    width: 1px;
    height: 37px;
    background: #dce2e8;
}
.hero-visual {
    position: relative;
    min-width: 0;
}
.hero-visual > img {
    display: block;
    width: 100%;
    height: 445px;
    object-fit: cover;
    border-radius: 28px 110px 28px 28px;
}
.hero-floating {
    position: absolute;
    left: -24px;
    bottom: 27px;
    display: flex;
    align-items: center;
    gap: 12px;
    background: #fff;
    border-radius: 14px;
    padding: 16px 20px;
    box-shadow: 0 14px 50px #17212e24;
}
.floating-icon {
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: #f0f4ff;
    color: var(--accent-color, #2563eb);
    font-size: 27px;
}
.hero-floating strong,
.hero-floating small {
    display: block;
}
.hero-floating strong {
    font-size: 13px;
}
.hero-floating small {
    color: #64748b;
    margin-top: 4px;
    font-size: 12px;
}
.section {
    padding-block: 74px 82px;
}
.section-soft {
    background: var(--surface-color, #f8fafc);
}
.section-heading {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 30px;
}
.section-heading h2 {
    font-size: clamp(27px, 3.4vw, 39px);
    margin: 9px 0 10px;
    letter-spacing: -0.8px;
}
.section-heading p {
    color: #64748b;
    margin: 0;
    font-size: 14px;
}
.view-all {
    white-space: nowrap;
    text-decoration: none;
    color: var(--accent-color, #2563eb);
    font-weight: 700;
    font-size: 14px;
}
.view-all:hover {
    text-decoration: underline;
}
.view-all span {
    margin-left: 6px;
}
.product-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 22px;
}
.recipe-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 23px;
}
.recipe-card {
    min-width: 0;
    background: #fff;
    border: 1px solid #e6eaf0;
    border-radius: 15px;
    overflow: hidden;
    transition:
        transform 0.2s,
        box-shadow 0.2s;
}
.recipe-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px #0000000c;
}
.recipe-image {
    position: relative;
    height: 205px;
    background: #f1f5f9;
}
.recipe-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.category {
    position: absolute;
    top: 13px;
    left: 13px;
    border-radius: 7px;
    padding: 7px 10px;
    font-size: 11px;
    font-weight: 700;
    background: #fff;
    color: #334155;
}
.recipe-body {
    padding: 20px;
}
.meta {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    font-size: 12px;
    color: #64748b;
}
.recipe-body h3 {
    margin: 12px 0 9px;
    font-size: 18px;
    line-height: 1.4;
}
.recipe-body p {
    font-size: 13px;
    line-height: 1.7;
    color: #64748b;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    min-height: 44px;
}
.recipe-link {
    display: inline-block;
    margin-top: 6px;
    font-size: 13px;
    font-weight: 700;
    text-decoration: none;
    color: var(--accent-color, #2563eb);
}
.message {
    padding: 35px 22px;
    border: 1px solid #e5e7eb;
    border-radius: 13px;
    background: #fff;
    text-align: center;
    color: #64748b;
}
.message.error {
    color: #b91c1c;
}
.message button {
    margin-left: 10px;
    border: 0;
    background: transparent;
    color: var(--accent-color, #2563eb);
    font-weight: 700;
    cursor: pointer;
}
.cta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 70px;
    border-radius: 22px;
    padding: 40px;
    background: var(--surface-color, #f8fafc);
}
.cta h2 {
    margin: 10px 0;
    font-size: 28px;
}
.cta p {
    margin: 0;
    color: #64748b;
}
@media (max-width: 1000px) {
    .product-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .hero {
        gap: 28px;
    }
    .hero-visual > img {
        height: 380px;
    }
}
@media (max-width: 700px) {
    .shell {
        width: min(100% - 32px, 1200px);
    }
    .hero {
        grid-template-columns: 1fr;
        padding-block: 42px 58px;
    }
    .hero h1 {
        letter-spacing: -1px;
    }
    .hero-visual > img {
        height: 290px;
        border-radius: 18px 70px 18px 18px;
    }
    .hero-floating {
        left: 10px;
        bottom: 12px;
    }
    .section {
        padding-block: 55px;
    }
    .section-heading {
        align-items: flex-start;
        flex-direction: column;
    }
    .recipe-grid {
        grid-template-columns: 1fr;
    }
    .cta {
        padding: 26px;
        align-items: flex-start;
        flex-direction: column;
        margin-bottom: 35px;
    }
    .cta h2 {
        font-size: 23px;
    }
}
@media (max-width: 480px) {
    .product-grid {
        grid-template-columns: 1fr;
    }
    .hero-highlights {
        margin-top: 30px;
    }
    .hero h1 {
        font-size: 38px;
    }
}
</style>
