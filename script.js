const STORAGE_KEY = "todo_simple_v1";
const newInput = document.getElementById("newInput");
const addBtn = document.getElementById("addBtn");
const todoListEl = document.getElementById("todoList");
const countText = document.getElementById("countText");
const filters = document.querySelectorAll(".filter");
const clearCompletedBtn = document.getElementById("clearCompleted");

let todos = loadTodos();
let currentFilter = "all";

// render inicial
render();

// Eventos
document.getElementById("newForm").addEventListener("submit", () => {
  addTodoFromInput();
});

addBtn.addEventListener("click", (e) => {
  e.preventDefault();
  addTodoFromInput();
});

newInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTodoFromInput();
});

filters.forEach((btn) =>
  btn.addEventListener("click", () => {
    filters.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    render();
  })
);

clearCompletedBtn.addEventListener("click", () => {
  todos = todos.filter((t) => !t.completed);
  saveTodos();
  render();
});

// Funções
function addTodoFromInput() {
  const text = newInput.value.trim();
  if (!text) return;
  const todo = { id: Date.now().toString(), text, completed: false };
  todos.unshift(todo); // adiciona no topo
  newInput.value = "";
  saveTodos();
  render();
}

function toggleCompleted(id) {
  todos = todos.map((t) =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );
  saveTodos();
  render();
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  render();
}

function updateTodoText(id, newText) {
  todos = todos.map((t) => (t.id === id ? { ...t, text: newText } : t));
  saveTodos();
  render();
}

function render() {
  // aplica filtro
  let visible = todos.slice(); // copia
  if (currentFilter === "active") visible = visible.filter((t) => !t.completed);
  if (currentFilter === "completed")
    visible = visible.filter((t) => t.completed);

  // limpa lista
  todoListEl.innerHTML = "";

  // cria elementos
  visible.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo" + (todo.completed ? " completed" : "");

    // checkbox
    const cb = document.createElement("div");
    cb.className = "checkbox";
    cb.setAttribute("role", "button");
    cb.title = todo.completed
      ? "Marcar como pendente"
      : "Marcar como concluída";
    cb.innerHTML = todo.completed ? "✓" : "";
    cb.addEventListener("click", () => toggleCompleted(todo.id));

    // texto (duplo clique para editar)
    const textEl = document.createElement("div");
    textEl.className = "text";
    textEl.textContent = todo.text;
    textEl.addEventListener("dblclick", () => startEdit(li, todo));

    // ações
    const actions = document.createElement("div");
    actions.className = "actions";
    const editBtn = document.createElement("button");
    editBtn.className = "btn";
    editBtn.textContent = "Editar";
    editBtn.addEventListener("click", () => startEdit(li, todo));

    const delBtn = document.createElement("button");
    delBtn.className = "btn";
    delBtn.textContent = "Excluir";
    delBtn.addEventListener("click", () => deleteTodo(todo.id));

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    li.appendChild(cb);
    li.appendChild(textEl);
    li.appendChild(actions);

    todoListEl.appendChild(li);
  });

  // contador
  const remaining = todos.filter((t) => !t.completed).length;
  countText.textContent = `${remaining} tarefa${
    remaining !== 1 ? "s" : ""
  } restante(s)`;
}

function startEdit(li, todo) {
  // substitui o conteúdo por um input para editar
  li.innerHTML = "";
  li.classList.remove("completed");

  const input = document.createElement("input");
  input.className = "edit-input";
  input.value = todo.text;
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") finishEdit();
    if (e.key === "Escape") render();
  });

  input.addEventListener("blur", finishEdit);

  function finishEdit() {
    const newText = input.value.trim();
    if (!newText) {
      // se apagar tudo, considera exclusão
      deleteTodo(todo.id);
    } else {
      updateTodoText(todo.id, newText);
    }
  }

  li.appendChild(input);
  input.focus();
  // posiciona cursor no fim
  input.selectionStart = input.selectionEnd = input.value.length;
}

// localStorage
function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error("Erro ao carregar todos:", err);
    return [];
  }
}

function saveTodos() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (err) {
    console.error("Erro ao salvar todos:", err);
  }
}

// para desenvolvedor: função global para limpar tudo (abra console e chame clearAllTodos())
function clearAllTodos() {
  todos = [];
  saveTodos();
  render();
}
window.clearAllTodos = clearAllTodos;
