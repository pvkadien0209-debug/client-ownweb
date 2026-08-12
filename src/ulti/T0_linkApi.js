let LinkAPI = "";

if (typeof window !== "undefined" && window.location.hostname === "localhost") {
  console.log("LocalHost");
  LinkAPI = "http://localhost:5000/";
} else {
  console.log("Not Local");
  LinkAPI = "https://pvd-e-app-73380f304a78.herokuapp.com/";
}

export default LinkAPI;
