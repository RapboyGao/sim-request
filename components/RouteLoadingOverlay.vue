<template>
  <Teleport to="body">
    <Transition name="route-loading">
      <div v-if="active" class="route-loading" aria-live="polite" aria-busy="true">
        <div class="route-loading__backdrop" />
        <div class="route-loading__panel">
          <div class="route-loading__cockpit">
            <div class="route-loading__ring route-loading__ring--outer" />
            <div class="route-loading__ring route-loading__ring--inner" />
            <div class="route-loading__core">
              <div class="route-loading__horizon">
                <span class="route-loading__dot" />
                <span class="route-loading__dot route-loading__dot--slow" />
                <span class="route-loading__dot route-loading__dot--fast" />
              </div>
              <div class="route-loading__title">{{ title }}</div>
              <div class="route-loading__subtitle">{{ subtitle }}</div>
            </div>
          </div>
          <div class="route-loading__runway">
            <span v-for="n in 5" :key="n" class="route-loading__mark" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  active: boolean
}>(), {
  active: false,
})

const title = 'Observation'
const subtitle = 'Loading next view'

const active = computed(() => props.active)
</script>

<style scoped>
.route-loading {
  position: fixed;
  inset: 0;
  z-index: 2500;
  display: grid;
  place-items: center;
  pointer-events: none;
  isolation: isolate;
}

.route-loading__backdrop {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 50% 35%, color-mix(in srgb, var(--primary) 26%, transparent), transparent 42%),
    linear-gradient(135deg, color-mix(in srgb, var(--bg) 82%, transparent), color-mix(in srgb, var(--surface) 92%, transparent));
  backdrop-filter: blur(10px) saturate(1.15);
  opacity: 0.98;
}

.route-loading__panel {
  position: relative;
  width: min(92vw, 420px);
  padding: 24px 20px 18px;
  border-radius: 28px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--surface) 92%, transparent), color-mix(in srgb, var(--surface-variant) 78%, transparent));
  border: 1px solid color-mix(in srgb, var(--border) 70%, transparent);
  box-shadow: 0 24px 60px var(--shadow);
  overflow: hidden;
}

.route-loading__panel::after {
  content: '';
  position: absolute;
  inset: -40% -12% auto;
  height: 120px;
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--primary) 14%, transparent), transparent);
  transform: rotate(-8deg);
  animation: sweep 1.9s linear infinite;
}

.route-loading__cockpit {
  position: relative;
  width: 220px;
  height: 220px;
  margin: 0 auto;
  display: grid;
  place-items: center;
}

.route-loading__ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid color-mix(in srgb, var(--primary) 22%, transparent);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--primary) 10%, transparent) inset;
}

.route-loading__ring--outer {
  inset: 6px;
  animation: spin 8s linear infinite;
}

.route-loading__ring--inner {
  inset: 26px;
  border-style: dashed;
  animation: spinReverse 5.5s linear infinite;
}

.route-loading__core {
  position: relative;
  width: 142px;
  height: 142px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  text-align: center;
  background:
    radial-gradient(circle at 50% 38%, color-mix(in srgb, var(--primary) 18%, transparent), transparent 55%),
    linear-gradient(180deg, color-mix(in srgb, var(--surface) 84%, transparent), color-mix(in srgb, var(--surface-variant) 70%, transparent));
  border: 1px solid color-mix(in srgb, var(--border) 75%, transparent);
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--primary) 10%, transparent),
    inset 0 0 24px color-mix(in srgb, var(--primary) 8%, transparent);
}

.route-loading__horizon {
  position: absolute;
  inset: 26px 26px auto;
  height: 4px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--primary) 45%, transparent);
  overflow: hidden;
}

.route-loading__horizon::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.32), transparent);
  animation: glide 1.1s ease-in-out infinite;
}

.route-loading__dot {
  position: absolute;
  top: 18px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--primary);
  box-shadow: 0 0 18px color-mix(in srgb, var(--primary) 70%, transparent);
  animation: bob 1.4s ease-in-out infinite;
}

.route-loading__dot:first-child {
  left: 25px;
}

.route-loading__dot--slow {
  left: 55px;
  animation-delay: 0.15s;
}

.route-loading__dot--fast {
  right: 25px;
  animation-delay: 0.3s;
}

.route-loading__title {
  margin-top: 28px;
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--text);
}

.route-loading__subtitle {
  margin-top: 8px;
  font-size: 0.86rem;
  color: var(--muted);
}

.route-loading__runway {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 18px;
}

.route-loading__mark {
  width: 28px;
  height: 4px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--primary) 24%, transparent);
  animation: pulse 1.4s ease-in-out infinite;
}

.route-loading__mark:nth-child(2) { animation-delay: 0.12s; }
.route-loading__mark:nth-child(3) { animation-delay: 0.24s; }
.route-loading__mark:nth-child(4) { animation-delay: 0.36s; }
.route-loading__mark:nth-child(5) { animation-delay: 0.48s; }

.route-loading-enter-active,
.route-loading-leave-active {
  transition: opacity 0.18s ease;
}

.route-loading-enter-from,
.route-loading-leave-to {
  opacity: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes spinReverse {
  to { transform: rotate(-360deg); }
}

@keyframes bob {
  0%, 100% { transform: translateY(0); opacity: 0.75; }
  50% { transform: translateY(-4px); opacity: 1; }
}

@keyframes pulse {
  0%, 100% { transform: scaleX(0.76); opacity: 0.45; }
  50% { transform: scaleX(1); opacity: 1; }
}

@keyframes glide {
  0% { transform: translateX(-120%); }
  100% { transform: translateX(120%); }
}

@keyframes sweep {
  0% { transform: translateX(-35%) rotate(-8deg); }
  100% { transform: translateX(135%) rotate(-8deg); }
}
</style>
