<script setup lang="ts">
import { checklistsHomeRoute } from '~/utils/checklist-routes'

definePageMeta({ layout: 'checklists' })

await navigateTo(checklistsHomeRoute(useChecklistPassword()), { replace: true })
</script>
