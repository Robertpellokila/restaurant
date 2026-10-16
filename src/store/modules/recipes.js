import api, { getApiError } from "../../services/api.js";
import {
  normalizeCollection,
  normalizeRecipe,
  normalizeRecord,
} from "../../services/firebase.js";

export default {
  namespaced: true,
  state: () => ({
    recipes: [],
    selectedRecipe: null,
    searchQuery: "",
    selectedCategory: "Semua",
    loading: false,
    loaded: false,
    error: null,
  }),
  getters: {
    allRecipes: (state) => state.recipes,
    selectedRecipe: (state) => state.selectedRecipe,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    totalRecipes: (state) => state.recipes.length,
    getRecipeById: (state) => (id) =>
      state.recipes.find((recipe) => recipe.id === String(id)),
    categories: (state) => [
      "Semua",
      ...new Set(state.recipes.map((recipe) => recipe.category)),
    ],
    filteredRecipes: (state) => {
      const query = state.searchQuery.toLowerCase().trim();
      return state.recipes.filter((recipe) => {
        const searchable = [
          recipe.name,
          recipe.description,
          ...recipe.ingredients,
        ]
          .join(" ")
          .toLowerCase();
        return (
          searchable.includes(query) &&
          (state.selectedCategory === "Semua" ||
            recipe.category === state.selectedCategory)
        );
      });
    },
  },
  mutations: {
    SET_RECIPES(state, recipes) {
      state.recipes = recipes;
      state.loaded = true;
    },
    SET_SELECTED_RECIPE(state, recipe) {
      state.selectedRecipe = recipe;
    },
    SET_SEARCH_QUERY(state, query) {
      state.searchQuery = query;
    },
    SET_CATEGORY(state, category) {
      state.selectedCategory = category;
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
  },
  actions: {
    async fetchRecipes({ commit, state }, { force = false } = {}) {
      if (state.loaded && !force && !state.error) return state.recipes;
      commit("SET_LOADING", true);
      commit("SET_ERROR", null);
      try {
        const { data } = await api.get("/recipe.json");
        const recipes = normalizeCollection(data, normalizeRecipe);
        commit("SET_RECIPES", recipes);
        return recipes;
      } catch (error) {
        commit("SET_ERROR", getApiError(error));
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },
    async fetchRecipeById({ commit }, id) {
      commit("SET_LOADING", true);
      commit("SET_ERROR", null);
      commit("SET_SELECTED_RECIPE", null);
      try {
        const { data } = await api.get(
          `/recipe/${encodeURIComponent(id)}.json`,
        );
        const recipe = normalizeRecord(data, id, normalizeRecipe);
        commit("SET_SELECTED_RECIPE", recipe);
        return recipe;
      } catch (error) {
        commit("SET_ERROR", getApiError(error));
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },
    async searchRecipes({ commit, dispatch, getters }, keyword) {
      commit("SET_SEARCH_QUERY", keyword);
      await dispatch("fetchRecipes");
      return getters.filteredRecipes;
    },
    selectRecipe({ commit, getters }, id) {
      commit("SET_SELECTED_RECIPE", getters.getRecipeById(id) || null);
    },
    closeRecipe({ commit }) {
      commit("SET_SELECTED_RECIPE", null);
    },
    resetFilters({ commit }) {
      commit("SET_SEARCH_QUERY", "");
      commit("SET_CATEGORY", "Semua");
    },
  },
};
