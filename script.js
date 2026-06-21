function showForm(type){

    let section = document.getElementById("formSection");
    let title = document.getElementById("formTitle");

    section.classList.remove("hidden");

    if(type === "help"){
        title.innerHTML = "Tell us what help you need 📚";
    }
    else{
        title.innerHTML = "Tell us how you can help 🤝";
    }

}
