<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" lg="8" xl="7">
        <v-card class="pa-6 rules-card">
          <p class="eyebrow">预约规则</p>
          <h1 class="text-h4 mb-2">简单、明确、适合手机阅读</h1>
          <p class="subcopy mb-6">只保留用户真正需要知道的内容，不把规则页做成长文档。</p>

          <v-list density="comfortable" lines="two">
            <v-list-item title="时段规则" subtitle="每天按 2 小时切分，共 12 个时段；每个时段最多 2 人确认，超出进入候补。" />
            <v-list-item title="优先级规则" subtitle="同学优先于非同学；同一优先级按提交时间排序。" />
            <v-list-item title="预约方式" subtitle="首页填写日期、姓名、是否为同学，并可一次选择多个时段提交。" />
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.rules-card {
  background: linear-gradient(135deg, rgba(15, 118, 110, 0.12), rgba(249, 115, 22, 0.06));
}

.eyebrow {
  color: var(--primary);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 0.8rem;
  margin-bottom: 0.75rem;
}

.subcopy {
  color: var(--muted);
}
</style>
