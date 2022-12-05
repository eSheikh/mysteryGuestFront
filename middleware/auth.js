export default defineNuxtRouteMiddleware((to, from) => {
   const jwtToken = useCookie('jwt_token')

   if (!jwtToken.value) {
      return abortNavigation()
   }
   return navigateTo('/login')
})
