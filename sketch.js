let signInButton, logoutButton, commentInput, saveCommentButton;
let userName = "";

let comments = []; // Array to store comments fetched from Firebase




function setup() {
    createCanvas(windowWidth, windowHeight);

    // Initialize the "Sign in with Google" button
    signInButton = createButton('Sign In with Google');
    signInButton.position(20, 20);
    signInButton.mousePressed(signInWithGoogle);

    // Initialize the logout button but hide it initially
    logoutButton = createButton('Logout');
    logoutButton.position(windowWidth - 120, 20); // Upper right corner
    logoutButton.mousePressed(signOut);
    logoutButton.hide();

    // Input for comments
    commentInput = createInput();
    commentInput.position(20, windowHeight - 40);
    commentInput.size(200);
    commentInput.hide();

    // Button to save the comment
    saveCommentButton = createButton('Save Comment');
    saveCommentButton.position(230, windowHeight - 40);
    saveCommentButton.mousePressed(saveComment);
    saveCommentButton.hide();

    // Adjust UI elements if the window is resized
    windowResized();

    // Authentication state observer
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            signInButton.hide();
            logoutButton.show();
            commentInput.show();
            saveCommentButton.show();
            userName = user.displayName || "User";
        } else {
            signInButton.show();
            logoutButton.hide();
            commentInput.hide();
            saveCommentButton.hide();
            userName = "";
        }
    });

    fetchComments(); // Fetch existing comments from Firebase
}

function draw() {
    background(220);
    // Show welcome message near logout button if user is signed in
    if (userName) {
        fill(0);
        textSize(16); // Smaller text size
        textAlign(RIGHT, TOP);
        text(`Welcome ${userName}`, windowWidth - 130, 15);

        displayComments(); 
    }
}

function signInWithGoogle() {
    let provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).catch((error) => {
        console.error("Error during sign-in:", error.message);
    });
}

function signOut() {
    firebase.auth().signOut().catch((error) => {
        console.error("Sign out error:", error.message);
    });
}

function saveComment() {
    const comment = commentInput.value();
    const userId = firebase.auth().currentUser.uid;
    // Save the comment to Firebase; adjust the path as necessary for your data structure
    firebase.database().ref('comments/' + userId).push({
        username: userName,
        comment: comment,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
        console.log("Comment saved successfully.");
        commentInput.value(''); // Clear the input after saving
    }).catch((error) => {
        console.error("Error saving comment:", error.message);
    });
    console.log(comments)
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    logoutButton.position(windowWidth - 120, 20);
    commentInput.position(20, windowHeight - 40);
    saveCommentButton.position(230, windowHeight - 40);
}


function displayComments() {
    
    function displayComments() {
        for (let comment of comments) {
            // Check if the comment and username are defined
            if (comment.text !== undefined && comment.username !== undefined) {
                fill(random(255), random(255), random(255)); // Choose a random color
                textSize(16);
                textFont("Sans-serif");
                // Display comment at a random position
                text(`${comment.username}: ${comment.text}`, random(width), random(height));
            }
        }
    }

}

function fetchComments() {
    // Reference to your comments node in Firebase Realtime Database
    let commentsRef = firebase.database().ref('comments');
    commentsRef.on('value', (snapshot) => {
        comments = []; // Reset comments array
        snapshot.forEach((childSnapshot) => {
            let comment = childSnapshot.val();
            comments.push({
                username: comment.username,
                text: comment.comment,
                // You can add more details here if needed
            });
        });
        redraw(); // Redraw the canvas to display new comments
    });
}
