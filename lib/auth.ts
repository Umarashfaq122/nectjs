const API_BASE_URL = "https://rda.ngrok.app/api";
const LOGIN_ENDPOINT = `${API_BASE_URL}/auth/login/`;

export async function loginUser(email: string, password: string) {
  try {
    const response = await fetch(LOGIN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        
      },
      body: JSON.stringify({ email, password }),
    });

    // Try parsing JSON, handle cases where API returns HTML error
    let data: any;
    try {
      data = await response.json();
    } catch {
      return {
        success: false,
        error: "Unable to connect to the server. Please try again.",
        shouldNavigate: true, // Don't navigate on connection error
      };
    }

    if (response.ok) {
      // Save tokens only if present
      if (data.access) localStorage.setItem("authToken", data.access);
      if (data.refresh) localStorage.setItem("refreshToken", data.refresh);

      // Save user data
      if (data.user) {
        localStorage.setItem(
          "userData",
          JSON.stringify({
            id: data.user.id,
            firstName: data.user.first_name,
            lastName: data.user.last_name,
            email: data.user.email,
            phoneNumber: data.user.phone_number,
            username: data.user.username,
            role: data.user.role,
            roleDisplay: data.user.role_display,
            cnic: data.user.cnic,
            isActive: data.user.is_active,
          })
        );

        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("userFirstName", data.user.first_name || "");
      }

      return { 
        success: true, 
        user: data.user,
        shouldNavigate: true // Navigate on success
      };
    }

    // API returned error
    return {
      success: false,
      error: data?.detail || data?.error || "Invalid credentials",
      shouldNavigate: true, // Don't navigate on credential error
    };
  } catch (error) {
    console.log("Login error:", error);
    return {
      success: false,
      error: "Unable to connect to the server",
      shouldNavigate: true, // Don't navigate on network error
    };
  }
}
export function logoutUser() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userData");
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userFirstName");
}

export function getAuthToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken");
  }
  return null;
}

export function getUserData() {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem("userData");
    try {
      return data ? JSON.parse(data) : null;
    } catch {
      return null; // prevent crash if JSON is corrupted
    }
  }
  return null;
}
