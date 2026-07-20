export default defineNuxtRouteMiddleware(async (to, from) => {
  const auth = useAuth()
  const user = await auth.getUser()

  if (!user) {
    return navigateTo('/')
  }
})
