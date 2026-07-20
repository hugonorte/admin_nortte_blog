<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import type { User } from '~/types/models'

const auth = useAuth()
const user = await auth.getUser() as User | null
const logout = auth.logout

withDefaults(defineProps<{ mode?: 'drawer' | 'slideover' | 'modal' }>(), { mode: 'drawer' })

// O menu responsivo é gerido internamente pelo UDashboardSidebar

const userRole = computed(() => user?.role || 'user')

const filteredItems = computed<NavigationMenuItem[]>(() => {
  const role = userRole.value;
  
  const allItems = [
    {
      label: 'Home',
      icon: 'i-lucide-house',
      to: '/admin/dashboard',
      roles: ['ADMIN', 'user', 'editor', 'author']
    }, 
    {
      label: 'Posts',
      icon: 'i-lucide-file-text',
      to: '/admin/posts',
      roles: ['ADMIN', 'editor', 'author']
    }, 
    {
      label: 'Autores',
      icon: 'i-lucide-user',
      to: '/admin/author',
      roles: ['ADMIN', 'editor']
    },
    {
      label: 'Categorias',
      icon: 'i-lucide-tag',
      to: '/admin/category',
      roles: ['ADMIN', 'editor']
    },
    {
      label: 'Usuários',
      icon: 'i-lucide-users',
      to: '/admin/user',
      roles: ['ADMIN']
    }
  ];

  return allItems.filter(item => item.roles.includes(role));
});

const bottomItems = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Perfil do Usuário',
    icon: 'i-lucide-user-circle',
    to: '/admin/profile'
  }
])

const logoutLink = {
  label: 'Logout',
  icon: 'i-lucide-log-out',
  click: logout
}
</script>

<template>
  <UDashboardGroup class="admin-layout">
    <header class="mobile-header flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <Logo class="h-6 w-auto" />
      <UDashboardSidebarToggle
        color="neutral"
        variant="ghost"
      />
    </header>

    <div class="dashboard-group flex">
      <UDashboardSidebar collapsible resizable :ui="{ footer: 'border-t border-default' }">
        <template #header="{ collapsed }">
          <Logo v-if="!collapsed" class="h-5 w-auto shrink-0" />
          <UIcon v-else name="i-simple-icons-nuxtdotjs" class="size-5 text-primary mx-auto" />
        </template>
    
        <template #default="{ collapsed }">
          <UButton
            :label="collapsed ? undefined : 'Search...'"
            icon="i-lucide-search"
            color="neutral"
            variant="outline"
            block
            :square="collapsed"
          >
            <template v-if="!collapsed" #trailing>
              <div class="flex items-center gap-0.5 ms-auto">
                <UKbd value="meta" variant="subtle" />
                <UKbd value="K" variant="subtle" />
              </div>
            </template>
          </UButton>
    
          <UNavigationMenu
            :collapsed="collapsed"
            :items="filteredItems"
            orientation="vertical"
          />
    
          <UNavigationMenu
            :collapsed="collapsed"
            :items="bottomItems"
            orientation="vertical"
            class="mt-auto"
          />
        </template>
    
        <template #footer="{ collapsed }">
          <UPageList>
            <UButton
              icon="i-lucide-user"
              :label="collapsed ? undefined : (user?.full_name || (user?.first_name + ' ' + user?.last_name) || 'Usuário')"
              color="neutral"
              variant="ghost"
              class="w-full"
              :block="collapsed"
            />
            <UButton 
              color="neutral" 
              variant="ghost" 
              :icon="logoutLink.icon"
              :label="collapsed ? undefined : logoutLink.label"
              :block="collapsed"
              @click="logoutLink.click"
            />
          </UPageList>
        </template>
      </UDashboardSidebar>
      


      <div class="flex-1 overflow-y-auto min-h-screen relative main-content">
        <slot />
      </div>
    </div>
  </UDashboardGroup>
</template>

<style scoped lang="scss">
@use '@/assets/css/abstracts/breakpoints' as bps;

.admin-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.dashboard-group {
  flex: 1;
  overflow: hidden;
}

.mobile-header {
  // Oculta o header mobile em telas >= lg (992px)
  @include bps.media-up('lg') {
    display: none !important;
  }
}

// Removida a classe .desktop-sidebar pois o UDashboardSidebar já se oculta naturalmente no mobile
</style>
