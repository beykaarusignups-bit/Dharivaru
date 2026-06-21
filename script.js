let postType = "Need Help";

const needBtn = document.getElementById("needBtn");
const helpBtn = document.getElementById("helpBtn");
const formTitle = document.getElementById("formTitle");

const form = document.getElementById("postForm");
const postsContainer = document.getElementById("postsContainer");

const description = document.getElementById("description");

let posts = [];

needBtn.addEventListener("click", () => {

    postType = "Need Help";

    needBtn.classList.add("active");
    helpBtn.classList.remove("active");

    formTitle.textContent = "Tell us what you need 📚";
    description.placeholder = "Describe what you need help with";

});

helpBtn.addEventListener("click", () => {

    postType = "Can Help";

    helpBtn.classList.add("active");
    needBtn.classList.remove("active");

    formTitle.textContent = "Tell us how you can help 🤝";
    description.placeholder = "Describe how you can help";

});

form.addEventListener("submit", (e) => {

    e.preventDefault();

    const post = {
        type: postType,
        name: document.getElementById("name").value,
        subject: document.getElementById("subject").value,
        description: description.value,
        contact: document.getElementById("contact").value
    };

    posts.unshift(post);

    renderPosts();

    form.reset();

});

function renderPosts() {

    postsContainer.innerHTML = "";

    posts.forEach(post => {

        const card = document.createElement("div");

        card.className =
            post.type === "Need Help"
            ? "post-card need-help"
            : "post-card can-help";

        card.innerHTML = `
            <div class="badge ${
                post.type === "Need Help"
                ? "red"
                : "green"
            }">
                ${post.type}
            </div>

            <h3>${post.name}</h3>

            <p><strong>Subject:</strong> ${post.subject}</p>

            <p>${post.description}</p>

            <p class="contact">
                📞 ${post.contact || "No contact provided"}
            </p>
        `;

        postsContainer.appendChild(card);

    });
}
