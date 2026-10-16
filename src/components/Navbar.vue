<template>
  <header class="header">
    <nav class="navbar">
      <ul class="nav-links">
        <li>
          <RouterLink to="/">Home</RouterLink>
        </li>

        <li>
          <RouterLink to="/about">About</RouterLink>
        </li>
        <li>
          <RouterLink to="/product">Product</RouterLink>
        </li>

        <li>
          <RouterLink to="/recipe">Recipe</RouterLink>
        </li>
        <li>
          <RouterLink to="/testimonial">Testimonial</RouterLink>
        </li>

        <li>
          <RouterLink to="/cart">
            Cart ({{ totalItems }})
          </RouterLink>
        </li>
      </ul>

      <!-- Mobile Menu Toggle -->
      <button
        class="menu-toggle"
        type="button"
        :aria-expanded="isMenuOpen"
        aria-label="Toggle navigation menu"
        @click="toggleMenu"
      >
        {{ isMenuOpen ? '✕' : '☰' }}
      </button>
    </nav>

    <!-- Mobile Menu -->
    <div v-if="isMenuOpen" class="mobile-menu">
      <RouterLink to="/" @click="closeMenu">
        Home
      </RouterLink>

      <RouterLink to="/about" @click="closeMenu">
        About
      </RouterLink>

      <RouterLink to="/product" @click="closeMenu">
        Product
      </RouterLink>

      <RouterLink to="/recipe" @click="closeMenu">
        Recipe
      </RouterLink>

      <RouterLink to="/testimonial" @click="closeMenu">
        Testimonial
      </RouterLink>

      <RouterLink to="/cart" @click="closeMenu">
        Cart ({{ totalItems }})
      </RouterLink>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

// Vuex Store
const store = useStore()

// Ambil jumlah item dari Vuex cart module
const totalItems = computed(() => {
  return store.getters['cart/cartCount']
})

// State untuk mobile menu
const isMenuOpen = computed(() => store.state.ui.isMenuOpen)

// Toggle menu mobile
function toggleMenu() {
  store.dispatch('ui/toggleMenu')
}

// Tutup menu setelah navigasi
function closeMenu() {
  store.dispatch('ui/closeMenu')
}
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  background: var(--secondary-color);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.navbar {
  max-width: 1400px;
  margin: auto;
  padding: 15px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 28px;
  font-weight: 800;
  color: var(--text-button);
  text-decoration: none;
}

.logo span {
  color: var(--accent-color);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 12px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-links li {
  position: relative;
}

.nav-links a {
  display: block;
  padding: 10px 14px;
  border-radius: 6px;
  text-decoration: none;
  color: var(--text-button);
  font-weight: 600;
  transition: 0.3s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: var(--accent-color);
}

.menu-toggle {
  display: none;
  border: none;
  background: none;
  color: var(--text-button);
  font-size: 26px;
  cursor: pointer;
}

.mobile-menu {
  display: none;
}

@media (max-width: 700px) {
  .navbar {
    padding: 14px 20px;
  }

  .nav-links {
    display: none;
  }

  .menu-toggle {
    display: block;
  }

  .mobile-menu {
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 10px 20px 20px;
    background: white;
  }

  .mobile-menu a {
    padding: 12px;
    border-radius: 6px;
    text-decoration: none;
    color: var(--text-button);
  }

  .mobile-menu a:hover,
  .mobile-menu a.router-link-active {
    color: var(--accent-color);
    background: #f5f5f5;
  }
}
</style>
