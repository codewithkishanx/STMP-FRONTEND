// socket.io-client is lazy-imported so landing/auth/profile bundles stay lean.
let socket = null;
let promise = null;

export const getSocket = () => {
  if (socket?.connected) return socket;
  if (!promise) {
    promise = import("socket.io-client").then(({ io }) => {
      const token = localStorage.getItem("loomboard_token");
      socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
        auth: { token },
        withCredentials: true,
      });
      promise = null;
      return socket;
    });
  }
  return promise;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
  promise = null;
};
