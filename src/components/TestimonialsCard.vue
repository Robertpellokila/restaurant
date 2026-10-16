<script setup>
// Menerima data dari TestimonialPage.vue
defineProps({
  testimonial: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <article class="testimonial-card">
    <!-- Header -->
    <div class="card-header">
      <div class="avatar">
        {{
          testimonial.user?.fullName
            ?.charAt(0)
            ?.toUpperCase() || 'U'
        }}
      </div>

      <div class="user-info">
        <h3>
          {{ testimonial.user?.fullName || 'Anonymous' }}
        </h3>

        <p>
          @{{ testimonial.user?.username || 'user' }}
        </p>
      </div>

      <span class="quote-symbol">“</span>
    </div>

    <!-- Testimonial Content -->
    <div class="card-content">
      <p class="testimonial-body">
        {{ testimonial.body }}
      </p>
    </div>

    <!-- Footer -->
    <div class="card-footer">
      <div class="likes">
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path
            d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"
          />
        </svg>

        <span>{{ testimonial.likes ?? 0 }} likes</span>
      </div>

      <span class="review-label">
        {{ testimonial.isSample ? 'Contoh testimoni' : 'Community Review' }}
      </span>
    </div>
  </article>
</template>

<style scoped>
.testimonial-card {
  display: flex;
  flex-direction: column;
  min-height: 250px;
  padding: 26px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #ffffff;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;
}

.testimonial-card:hover {
  transform: translateY(-5px);
  border-color: var(--accent-color, #2563eb);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.07);
}

/* Header */
.card-header {
  display: flex;
  align-items: center;
  gap: 13px;
}

.avatar {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--accent-color, #2563eb);
  color: #ffffff;
  font-size: 20px;
  font-weight: 700;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-info h3 {
  margin: 0 0 5px;
  color: #111827;
  font-size: 15px;
  font-weight: 700;
}

.user-info p {
  margin: 0;
  color: #94a3b8;
  font-size: 12px;
}

.quote-symbol {
  align-self: flex-start;
  color: var(--accent-color, #2563eb);
  font-size: 52px;
  font-family: Georgia, serif;
  line-height: 0.9;
  opacity: 0.45;
}

/* Content */
.card-content {
  flex: 1;
  padding: 24px 0;
}

.testimonial-body {
  margin: 0;
  color: #475569;
  font-size: 14px;
  line-height: 1.85;
  overflow-wrap: anywhere;
}

/* Footer */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.likes {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #64748b;
  font-size: 12px;
}

.likes svg {
  color: var(--accent-color, #2563eb);
}

.review-label {
  padding: 6px 10px;
  border-radius: 20px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 11px;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 480px) {
  .testimonial-card {
    min-height: 220px;
    padding: 20px;
  }

  .avatar {
    width: 42px;
    height: 42px;
    font-size: 17px;
  }

  .quote-symbol {
    font-size: 42px;
  }

  .card-content {
    padding: 20px 0;
  }
}
</style>
