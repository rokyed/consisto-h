import {Server} from "./server.js"

let master = new Server("master");
let slaves = [];

for(let i = 0; i < 5; i++) {
  let server = new Server("slave");
  slaves.push(server);
  master.addServer(server);
}

master.setAlgorithm((key, pool, properties, masterServer) => {
  let server = pool[Math.floor(Math.random() * pool.length)];
  return server;
});

setInterval(() => {
  let serverStats = master.stats();
  let keyStats = JSON.stringify(master.list());

  if (serverStats !== document.getElementById("stats").innerHTML) {
    document.getElementById("stats").innerHTML = serverStats;
  }
  if (keyStats !== document.getElementById("keys").innerHTML) {
    document.getElementById("keys").innerHTML = keyStats 
  }
}, 100);

document.querySelector("#button").addEventListener("click", () => {
  for (let i = 0; i < 100; i++) {
    let key = Math.random().toString(36).slice(2);
    let value = Math.random().toString(36).slice(2);
    master.set(key, value);
    console.log("set", key, value);
  }
});

document.querySelector("#add").addEventListener("click", () => {
  let server = new Server("slave");
  slaves.push(server);
  master.addServer(server);
});

document.querySelector("#drop").addEventListener("click", () => {
  // pick a random slave 
  let server = slaves[Math.floor(Math.random() * slaves.length)];
  master.dropServer(server);
  console.log("drop", server);
});

document.querySelector("#ask").addEventListener("click", () => {
  let key = prompt("key");
  try {
    let value = master.get(key);
    alert(`value: ${value} for key: ${key}`);
  } catch (e) {
    alert(`key not found: ${key}`);
    console.error(e);
  }
});



