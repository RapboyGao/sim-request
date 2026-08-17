import { inject, provide, shallowRef, type InjectionKey, type Ref } from 'vue'

export type ChecklistPageActions = {
  reset: () => void
  edit?: () => void
  duplicate?: () => void
  remove?: () => void
}

type ChecklistPageActionsContext = {
  actions: Ref<ChecklistPageActions | null>
  register: (actions: ChecklistPageActions | null) => void
}

const checklistPageActionsKey: InjectionKey<ChecklistPageActionsContext> = Symbol('checklist-page-actions')

export function provideChecklistsPageActions() {
  const actions = shallowRef<ChecklistPageActions | null>(null)
  const context: ChecklistPageActionsContext = {
    actions,
    register: (nextActions) => {
      actions.value = nextActions
    },
  }

  provide(checklistPageActionsKey, context)
  return context
}

export function useChecklistsPageActions() {
  const context = inject(checklistPageActionsKey)
  if (!context) throw new Error('Checklists page actions must be used inside the Checklists layout')
  return context
}
