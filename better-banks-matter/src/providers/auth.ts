import type { AuthProvider } from "@refinedev/core";

// import type { User } from "@/graphql/schema.types";
// import { disableAutoLogin, enableAutoLogin } from "@/hooks";

import { API_URL, dataProvider } from "./data";

export const authCredentials = {
  email: "huudanhnguyen1709@gmail.com",
  password: "demodemo",
};

export const authProvider: AuthProvider = {
  login: async ({ email }) => {
    try {
      const { data } = await dataProvider.custom({
        url: API_URL,
        method: "post",
        headers: {},
        meta: {
          variables: { email },
          rawQuery: `
                mutation Login($email: String!) {
                    login(loginInput: {
                      email: $email
                    }) {
                      accessToken,
                      refreshToken
                    }
                  }
                `,
        },
      });

      localStorage.setItem("access_token", data.login.accessToken);

      return {
        success: true,
        redirectTo: "/",
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: "message" in error ? error.message : "Login failed",
          name: "name" in error ? error.name : "Invalid email or password",
        },
      };
    }
  },
  register: async ({ email, password }) => {
    try {
      await dataProvider.custom({
        url: API_URL,
        method: "post",
        headers: {},
        meta: {
          variables: { email, password },
          rawQuery: `
                mutation register($email: String!, $password: String!) {
                    register(registerInput: {
                      email: $email
                        password: $password
                    }) {
                        id
                        email
                    }
                  }
                `,
        },
      });

      return {
        success: true,
        redirectTo: `/login?email=${email}`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: "message" in error ? error.message : "Register failed",
          name: "name" in error ? error.name : "Invalid email or password",
        },
      };
    }
  },
  logout: async () => {
    localStorage.removeItem("access_token");

    return {
      success: true,
      redirectTo: "/login",
    };
  },
  onError: async (error) => {
    if (error?.statusCode === "UNAUTHENTICATED") {
      return {
        logout: true,
      };
    }

    return { error };
  },
  check: async () => {
    try {
      await dataProvider.custom({
        url: API_URL,
        method: "post",
        headers: {},
        meta: {
          rawQuery: `
                    query Me {
                        me {
                          name
                        }
                      }
                `,
        },
      });

      return {
        authenticated: true,
      };
    } catch (error) {
      return {
        authenticated: false,
      };
    }
  },
  forgotPassword: async () => {
    return {
      success: true,
      redirectTo: "/update-password",
    };
  },
  updatePassword: async () => {
    return {
      success: true,
      redirectTo: "/login",
    };
  },
  getIdentity: async () => {
    const accessToken = localStorage.getItem("access_token");
    try {
      const { data } = await dataProvider.custom<{ me: any }>({
        url: API_URL,
        method: "post",
        headers: accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : {},
        meta: {
          rawQuery: `
                    query Me {
                        me {
                            id,
                            name,
                            email,
                            phone,
                            jobTitle,
                            timezone
                            avatarUrl
                        }
                      }
                `,
        },
      });

      return data.me;
    } catch (error) {
      return undefined;
    }
  },
};
