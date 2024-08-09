export class Server {
  #name = "";
  #type = "master";
  #pool = [];
  #storage = {};
  #masterServer = null;
  #properties = {};
  #algorithm = null;

  constructor(type="master") {
    this.#type = type;
    if (type === "master") {
      this.#pool = [this];
      this.#algorithm = () => {return this};
    }

    this.#name = Math.random().toString(36).slice(2);
  }

  get name() {
    return this.#name;
  }

  setAlgorithm(algorithm) {
    if (this.#type !== "master") return;

    if (typeof algorithm === "function") {
      this.#algorithm = algorithm;
    }

  }

  addServer(server) {
    if (this.#type !== "master") return;
    this.#pool.push(server);
    server.server_setMaster(this);
  }

  dropServer(server) {
    if (this.#type === "master" && server === this) return;
    
    if (this.#type !== "master") 
      return; 

    this.#pool = this.#pool.filter((s) => s !== server);
  }
  set(key, value) {
    if (this.#type === "master") {
      let server = this.#getServer(key);
      server.server_set(key, value);
    } else {
      this.#masterServer.set(key, value);
    }
  }

  get(key) {
    if (this.#type === "master") {
      let server = this.#getServer(key);
      return server.server_get(key);
    } else {
      return this.#masterServer.get(key);
    }
  }

  list() {
    let keys = [];
    if (this.#type === "master") {
      for (let i = 0; i < this.#pool.length; i++) {
        keys = keys.concat(this.#pool[i].server_list()); 
      }
    } else {
      keys = this.#masterServer.list();
    }

    return keys;
  }

  server_list() {
    return Object.keys(this.#storage);
  }

  server_setMaster(server) {
    if (this.#type === "master") return;

    this.#masterServer = server;
  }

  server_set(key, value) {
    this.#storage[key] = value;
  }

  server_get(key) {
    return this.#storage[key];
  }
  
  server_stats() {
    return `Server ${this.#name} has ${Object.keys(this.#storage).length} keys`;
  }

  stats() {
    if (this.#type === "master") {
      let html = "";
      html += `<p>Pool size: ${this.#pool.length}</p>`;
      for (let i = 0; i < this.#pool.length; i++) {
        html += `<p>${this.#pool[i].server_stats()}</p>`;
      }

      return html;
    } else {
      return this.#masterServer.stats();
    }
  }

  #getServer(key) {
    if (this.#algorithm) {
      return this.#algorithm(key, this.#pool, this.#properties, this);
    } else {
      return this;
    }
  }
}
