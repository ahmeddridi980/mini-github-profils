async function fetchUser(username) {
    try {
        const response = await fetch(`https://api.github.com/users/${username.trim()}`);
        if (!response.ok) throw new Error(`Utilisateur "${username}" non trouvé`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Erreur lors de la récupération de ${username}:`, error);
        return {
            error: true,
            username: username,
            message: error.message
        };
    }
}

async function fetchAllUsers(usernames) {
    const promises = usernames.map(username => fetchUser(username));
    const users = await Promise.all(promises);
    return users;
}

function displayUsers(users) {
    const container = document.getElementById("user");
    container.innerHTML = "";
    
    if (!users.length) {
        container.innerHTML = '<p class="error-message">Aucun utilisateur à afficher</p>';
        return;
    }

    users.forEach(user => {
        const userDiv = document.createElement("div");
        userDiv.classList.add("user-profile");
        
        if (user.error) {
            userDiv.innerHTML = `
                <div class="error-profile">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Erreur avec ${user.username}</h3>
                    <p>${user.message}</p>
                </div>
            `;
        } else {
            userDiv.innerHTML = `
                <img src="${user.avatar_url}" alt="${user.login}" class="avatar">
                <div class="user-info">
                    <h2>${user.name || user.login}</h2>
                    <p>${user.bio || 'Pas de bio disponible'}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${user.location || 'Non spécifié'}</p>
                    <div class="stats">
                        <div class="stat">
                            <h3>${user.public_repos}</h3>
                            <p>Dépôts</p>
                        </div>
                        <div class="stat">
                            <h3>${user.followers}</h3>
                            <p>Abonnés</p>
                        </div>
                        <div class="stat">
                            <h3>${user.following}</h3>
                            <p>Abonnements</p>
                        </div>
                    </div>
                    <a href="${user.html_url}" target="_blank" class="profile-link">
                        <i class="fab fa-github"></i> Voir le profil
                    </a>
                </div>
            `;
        }
        container.appendChild(userDiv);
    });
}

document.getElementById("fetchbutton").addEventListener("click", async () => {
    const input = document.getElementById("username").value;
    if (!input.trim()) {
        document.getElementById("user").innerHTML = `
            <p class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                Merci d'entrer au moins un nom d'utilisateur GitHub
            </p>
        `;
        return;
    }

    // Afficher le loader
    document.getElementById("user").innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Recherche des profils...</p>
        </div>
    `;

    const usernames = input.split(",").map(name => name.trim()).filter(name => name);
    try {
        const users = await fetchAllUsers(usernames);
        displayUsers(users);
    } catch (error) {
        document.getElementById("user").innerHTML = `
            <p class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                Une erreur est survenue: ${error.message}
            </p>
        `;
    }
});