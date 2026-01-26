// src/services/AuthService.js
class AuthService {
  static async login(username, password) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Demo login credentials
    if (username === "demo" && password === "demo") {
      const user = { username: "demo", role: "admin" };
      localStorage.setItem("user", JSON.stringify(user));
      return user;
    } else {
      throw new Error("Invalid username or password");
    }

    // TODO: Uncomment for real API
    // try {
    //   const response = await fetch('/api/auth/login', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ username, password })
    //   });
    //   const data = await response.json();
    //   if (response.ok) {
    //     localStorage.setItem("user", JSON.stringify(data.user));
    //     localStorage.setItem("token", data.token);
    //     return data.user;
    //   } else {
    //     throw new Error(data.message || 'Login failed');
    //   }
    // } catch (error) {
    //   throw new Error(error.message || 'Network error');
    // }
  }

  static logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    // TODO: Uncomment for real API
    // fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  }

  static getUser() {
    const data = localStorage.getItem("user");
    return data ? JSON.parse(data) : null;
  }

  // TODO: Uncomment for real API
  // static async getCurrentUser() {
  //   try {
  //     const token = localStorage.getItem("token");
  //     const response = await fetch('/api/auth/me', {
  //       headers: { 'Authorization': `Bearer ${token}` }
  //     });
  //     const data = await response.json();
  //     if (response.ok) {
  //       localStorage.setItem("user", JSON.stringify(data.user));
  //       return data.user;
  //     } else {
  //       this.logout();
  //       return null;
  //     }
  //   } catch (error) {
  //     this.logout();
  //     return null;
  //   }
  // }
}

export default AuthService;
