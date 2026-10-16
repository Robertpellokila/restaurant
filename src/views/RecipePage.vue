<script setup>
import { computed, onMounted, onUnmounted, watch } from "vue";
import { useStore } from "vuex";

const store = useStore();
const searchQuery = computed({
    get: () => store.state.recipes.searchQuery,
    set: (value) => store.commit("recipes/SET_SEARCH_QUERY", value),
});
const selectedCategory = computed({
    get: () => store.state.recipes.selectedCategory,
    set: (value) => store.commit("recipes/SET_CATEGORY", value),
});
const selectedRecipe = computed(() => store.getters["recipes/selectedRecipe"]);
const showModal = computed(() => Boolean(selectedRecipe.value));
const recipes = computed(() => store.getters["recipes/allRecipes"] ?? []);
const loading = computed(() => store.getters["recipes/isLoading"]);
const error = computed(() => store.getters["recipes/getError"]);
const categories = computed(() => store.getters["recipes/categories"]);
const filteredRecipes = computed(() => store.getters["recipes/filteredRecipes"]);

async function fetchRecipes() {
    try {
        await store.dispatch("recipes/fetchRecipes");
    } catch {
        // The Vuex error is displayed in the page.
    }
}
function openRecipe(recipe) {
    store.dispatch("recipes/selectRecipe", recipe.id);
}
function closeModal() {
    store.dispatch("recipes/closeRecipe");
}
function resetFilters() {
    store.dispatch("recipes/resetFilters");
}
function handleEscape(event) {
    if (event.key === "Escape") closeModal();
}
watch(showModal, (open) => {
    if (typeof document !== "undefined")
        document.body.style.overflow = open ? "hidden" : "";
});
onMounted(() => {
    if (!recipes.value.length) fetchRecipes();
    window.addEventListener("keydown", handleEscape);
});
onUnmounted(() => {
    closeModal();
    window.removeEventListener("keydown", handleEscape);
    document.body.style.overflow = "";
});
</script>

<template>
    <main class="recipe-page">
        <!-- Navbar aplikasi sudah ada di App.vue; tidak membuat navbar lagi di sini -->
        <section class="hero shell">
            <div class="hero-copy">
                <span class="eyebrow">COOK SOMETHING DELICIOUS</span>
                <h1>Inspirasi masakan <span>untuk setiap hari.</span></h1>
                <p>
                    Temukan berbagai ide resep lezat, pilih bahan favorit, dan
                    ikuti langkah memasak yang mudah.
                </p>
                <a class="primary-button" href="#recipes"
                    >Eksplor Resep <span aria-hidden="true">→</span></a
                >
                <div class="hero-stats">
                    <div>
                        <strong>{{ recipes.length }}</strong
                        ><small>Total resep</small>
                    </div>
                    <span class="divider"></span>
                    <div>
                        <strong>{{ categories.length - 1 }}</strong
                        ><small>Kategori</small>
                    </div>
                </div>
            </div>
            <div class="hero-image">
                <img
                    src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1000"
                    alt="Bahan makanan segar untuk memasak"
                />
                <div class="floating-card">
                    <span>✦</span>
                    <div>
                        <strong>Fresh inspiration</strong
                        ><small>Cook with confidence</small>
                    </div>
                </div>
            </div>
        </section>

        <section id="recipes" class="catalog-section">
            <div class="shell">
                <div class="section-heading">
                    <div>
                        <span class="eyebrow">FIND YOUR FAVORITE</span>
                        <h2>Jelajahi Resep</h2>
                        <p>Pilih resep favoritmu dan mulai memasak hari ini.</p>
                    </div>
                    <span class="recipe-count"
                        >{{ filteredRecipes.length }} resep ditemukan</span
                    >
                </div>
                <div class="search-box">
                    <span aria-hidden="true">⌕</span
                    ><input
                        v-model="searchQuery"
                        type="search"
                        placeholder="Cari resep atau bahan makanan..."
                        aria-label="Cari resep"
                    /><button
                        v-if="searchQuery"
                        type="button"
                        aria-label="Hapus pencarian"
                        @click="searchQuery = ''"
                    >
                        ×
                    </button>
                </div>
                <div class="categories" aria-label="Filter kategori resep">
                    <button
                        v-for="category in categories"
                        :key="category"
                        type="button"
                        :class="{ active: selectedCategory === category }"
                        @click="selectedCategory = category"
                    >
                        {{ category }}
                    </button>
                </div>
                <div
                    v-if="loading && !recipes.length"
                    class="state-message"
                    role="status"
                >
                    Memuat resep...
                </div>
                <div
                    v-else-if="error && !recipes.length"
                    class="state-message"
                    role="alert"
                >
                    <p>{{ error }}</p>
                    <button class="primary-button" @click="fetchRecipes">
                        Coba lagi
                    </button>
                </div>
                <div v-else-if="filteredRecipes.length" class="recipe-grid">
                    <article
                        v-for="recipe in filteredRecipes"
                        :key="recipe.id"
                        class="recipe-card"
                    >
                        <div class="card-image">
                            <img
                                :src="recipe.image"
                                :alt="recipe.name"
                                loading="lazy"
                            /><span class="category-badge">{{
                                recipe.category
                            }}</span
                            ><span class="rating-badge"
                                >★ {{ recipe.rating }}</span
                            >
                        </div>
                        <div class="card-content">
                            <div class="recipe-meta">
                                <span>◷ {{ recipe.time }} menit</span
                                ><span>{{ recipe.servings }} porsi</span>
                            </div>
                            <h3>{{ recipe.name }}</h3>
                            <p class="recipe-description">
                                {{ recipe.description }}
                            </p>
                            <div class="card-footer">
                                <span class="difficulty">{{
                                    recipe.difficulty
                                }}</span
                                ><button
                                    class="detail-button"
                                    type="button"
                                    @click="openRecipe(recipe)"
                                >
                                    Lihat Resep →
                                </button>
                            </div>
                        </div>
                    </article>
                </div>
                <div v-else class="state-message">
                    <h3>Resep tidak ditemukan</h3>
                    <p>Coba kata kunci atau kategori lain.</p>
                    <button
                        class="primary-button"
                        type="button"
                        @click="resetFilters"
                    >
                        Reset filter
                    </button>
                </div>
            </div>
        </section>

        <Teleport to="body">
            <div
                v-if="showModal && selectedRecipe"
                class="modal-overlay"
                @click.self="closeModal"
            >
                <section
                    class="recipe-modal"
                    role="dialog"
                    aria-modal="true"
                    :aria-label="selectedRecipe.name"
                >
                    <button
                        class="modal-close"
                        type="button"
                        aria-label="Tutup detail resep"
                        @click="closeModal"
                    >
                        ×
                    </button>
                    <img
                        class="modal-image"
                        :src="selectedRecipe.image"
                        :alt="selectedRecipe.name"
                    />
                    <div class="modal-content">
                        <span class="eyebrow">{{
                            selectedRecipe.category
                        }}</span>
                        <h2>{{ selectedRecipe.name }}</h2>
                        <p class="modal-description">
                            {{ selectedRecipe.description }}
                        </p>
                        <div class="modal-stats">
                            <div>
                                <strong>{{ selectedRecipe.time }} menit</strong
                                ><small>Waktu masak</small>
                            </div>
                            <div>
                                <strong>{{ selectedRecipe.servings }}</strong
                                ><small>Porsi</small>
                            </div>
                            <div>
                                <strong>{{ selectedRecipe.difficulty }}</strong
                                ><small>Kesulitan</small>
                            </div>
                        </div>
                        <h3>Bahan-bahan</h3>
                        <ul class="ingredient-list">
                            <li
                                v-for="(
                                    ingredient, index
                                ) in selectedRecipe.ingredients || []"
                                :key="index"
                            >
                                <span class="ingredient-dot">✓</span
                                >{{ ingredient }}
                            </li>
                        </ul>
                        <h3>Langkah memasak</h3>
                        <ol class="step-list">
                            <li
                                v-for="(step, index) in selectedRecipe.steps ||
                                []"
                                :key="index"
                            >
                                <span class="step-number">{{ index + 1 }}</span
                                ><span>{{ step }}</span>
                            </li>
                        </ol>
                        <button
                            class="primary-button done-button"
                            type="button"
                            @click="closeModal"
                        >
                            Selesai
                        </button>
                    </div>
                </section>
            </div>
        </Teleport>
    </main>
</template>

<style scoped>
.recipe-page {
    min-height: 100vh;
    color: var(--text-color, #1f2937);
    background: var(--background-color, #fff);
}
.shell {
    width: min(1200px, calc(100% - 48px));
    margin: 0 auto;
}
.eyebrow {
    display: inline-block;
    color: var(--accent-color, #2563eb);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1.8px;
}
.hero {
    padding-block: 60px 75px;
    display: grid;
    grid-template-columns: 1fr 0.95fr;
    gap: clamp(30px, 6vw, 80px);
    align-items: center;
}
.hero h1 {
    font-size: clamp(38px, 5vw, 61px);
    letter-spacing: -1.8px;
    line-height: 1.15;
    margin: 20px 0;
    font-weight: 800;
}
.hero h1 span {
    color: var(--accent-color, #2563eb);
}
.hero-copy > p {
    font-size: 15px;
    max-width: 510px;
    color: #64748b;
    line-height: 1.85;
    margin-bottom: 28px;
}
.primary-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 13px 22px;
    background: var(--accent-color, #2563eb);
    border: none;
    border-radius: 9px;
    color: #fff;
    text-decoration: none;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
}
.primary-button:hover {
    opacity: 0.88;
}
.hero-stats {
    margin-top: 39px;
    display: flex;
    gap: 24px;
    align-items: center;
}
.hero-stats div {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.hero-stats strong {
    font-size: 25px;
}
.hero-stats small {
    font-size: 12px;
    color: #64748b;
}
.divider {
    width: 1px;
    height: 38px;
    background: #e2e8f0;
}
.hero-image {
    position: relative;
}
.hero-image > img {
    width: 100%;
    height: 405px;
    object-fit: cover;
    border-radius: 25px 105px 25px 25px;
    display: block;
}
.floating-card {
    position: absolute;
    bottom: 20px;
    left: -22px;
    display: flex;
    align-items: center;
    gap: 13px;
    background: #fff;
    border-radius: 12px;
    padding: 16px 19px;
    box-shadow: 0 12px 32px #1e293b26;
}
.floating-card > span {
    font-size: 24px;
    color: var(--accent-color, #2563eb);
}
.floating-card strong,
.floating-card small {
    display: block;
}
.floating-card strong {
    font-size: 13px;
}
.floating-card small {
    font-size: 11px;
    color: #64748b;
    margin-top: 4px;
}
.catalog-section {
    background: var(--surface-color, #f8fafc);
    padding: 70px 0 90px;
    scroll-margin-top: 30px;
}
.section-heading {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 28px;
}
.section-heading h2 {
    font-size: clamp(28px, 3.4vw, 39px);
    margin: 9px 0;
}
.section-heading p {
    font-size: 14px;
    color: #64748b;
    margin: 0;
}
.recipe-count {
    padding: 10px 14px;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 12px;
    color: #64748b;
    white-space: nowrap;
}
.search-box {
    width: min(100%, 650px);
    display: flex;
    align-items: center;
    gap: 12px;
    border: 1px solid #e2e8f0;
    background: #fff;
    border-radius: 10px;
    padding: 0 17px;
}
.search-box:focus-within {
    border-color: var(--accent-color, #2563eb);
}
.search-box > span {
    font-size: 29px;
    color: var(--accent-color, #2563eb);
}
.search-box input {
    background: transparent;
    border: none;
    outline: none;
    padding: 16px 0;
    min-width: 0;
    flex: 1;
    font: inherit;
    font-size: 14px;
    color: #1e293b;
}
.search-box button {
    border: 0;
    background: none;
    font-size: 24px;
    color: #64748b;
    cursor: pointer;
}
.categories {
    display: flex;
    flex-wrap: wrap;
    gap: 9px;
    margin: 23px 0 32px;
}
.categories button {
    padding: 10px 16px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: #fff;
    color: #64748b;
    font: inherit;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
}
.categories button:hover,
.categories button.active {
    background: var(--accent-color, #2563eb);
    border-color: var(--accent-color, #2563eb);
    color: #fff;
}
.recipe-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 24px;
}
.recipe-card {
    background: #fff;
    border: 1px solid #e6eaf0;
    border-radius: 15px;
    overflow: hidden;
    min-width: 0;
    transition:
        transform 0.2s,
        box-shadow 0.2s;
}
.recipe-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 30px #0000000d;
}
.card-image {
    position: relative;
    height: 215px;
    background: #f1f5f9;
}
.card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.category-badge,
.rating-badge {
    position: absolute;
    top: 13px;
    padding: 7px 10px;
    background: #fff;
    border-radius: 7px;
    font-size: 11px;
    font-weight: 700;
}
.category-badge {
    left: 13px;
}
.rating-badge {
    right: 13px;
    color: #b7791f;
}
.card-content {
    padding: 20px;
}
.recipe-meta {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    color: #64748b;
    font-size: 12px;
}
.card-content h3 {
    font-size: 19px;
    line-height: 1.4;
    margin: 14px 0 8px;
}
.recipe-description {
    font-size: 13px;
    line-height: 1.75;
    color: #64748b;
    min-height: 45px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    margin-top: 19px;
    padding-top: 15px;
    border-top: 1px solid #edf0f4;
}
.difficulty {
    font-size: 12px;
    font-weight: 700;
    color: #475569;
}
.detail-button {
    border: 0;
    background: color-mix(in srgb, var(--accent-color, #2563eb) 9%, white);
    color: var(--accent-color, #2563eb);
    padding: 10px 13px;
    border-radius: 8px;
    font-weight: 700;
    font-size: 12px;
    cursor: pointer;
}
.state-message {
    text-align: center;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 48px 20px;
    color: #64748b;
}
.state-message h3 {
    color: #1e293b;
}
.state-message .primary-button {
    margin-top: 10px;
}
.modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    background: #0f172ac9;
    backdrop-filter: blur(4px);
}
.recipe-modal {
    position: relative;
    width: min(100%, 700px);
    max-height: 90dvh;
    overflow-y: auto;
    background: white;
    border-radius: 17px;
}
.modal-close {
    position: absolute;
    right: 16px;
    top: 16px;
    display: grid;
    place-items: center;
    width: 39px;
    height: 39px;
    border: 0;
    border-radius: 50%;
    font-size: 24px;
    background: #fff;
    color: #1e293b;
    cursor: pointer;
    z-index: 1;
    box-shadow: 0 3px 14px #0002;
}
.modal-image {
    height: 250px;
    width: 100%;
    object-fit: cover;
    display: block;
}
.modal-content {
    padding: 30px;
}
.modal-content h2 {
    font-size: 30px;
    margin: 12px 0;
}
.modal-description {
    font-size: 14px;
    color: #64748b;
    line-height: 1.8;
}
.modal-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    padding: 22px 0;
    margin: 22px 0;
    border-top: 1px solid #e2e8f0;
    border-bottom: 1px solid #e2e8f0;
}
.modal-stats div {
    display: flex;
    flex-direction: column;
    gap: 7px;
}
.modal-stats strong {
    font-size: 14px;
}
.modal-stats small {
    font-size: 11px;
    color: #64748b;
}
.modal-content h3 {
    font-size: 17px;
    margin: 26px 0 15px;
}
.ingredient-list,
.step-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 0;
    margin: 0;
}
.ingredient-list li,
.step-list li {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    font-size: 13px;
    color: #475569;
    line-height: 1.75;
}
.ingredient-dot,
.step-number {
    width: 24px;
    height: 24px;
    flex: none;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: #e7f4ec;
    color: #23844a;
    font-size: 12px;
    font-weight: 700;
}
.step-number {
    background: #e8efff;
    color: var(--accent-color, #2563eb);
}
.done-button {
    margin-top: 30px;
    width: 100%;
}
@media (max-width: 950px) {
    .recipe-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .hero-image > img {
        height: 350px;
    }
}
@media (max-width: 700px) {
    .shell {
        width: calc(100% - 32px);
    }
    .hero {
        grid-template-columns: 1fr;
        padding-block: 42px 60px;
    }
    .hero h1 {
        letter-spacing: -1px;
    }
    .hero-image > img {
        height: 290px;
        border-radius: 18px 70px 18px 18px;
    }
    .floating-card {
        left: 10px;
    }
    .catalog-section {
        padding: 55px 0;
    }
    .section-heading {
        flex-direction: column;
        align-items: start;
    }
    .recipe-grid {
        grid-template-columns: 1fr;
    }
    .modal-overlay {
        padding: 12px;
    }
    .modal-content {
        padding: 21px;
    }
    .modal-content h2 {
        font-size: 25px;
    }
    .modal-image {
        height: 200px;
    }
    .modal-stats strong {
        font-size: 12px;
    }
}
</style>
