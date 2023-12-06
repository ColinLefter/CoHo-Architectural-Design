$(function(){
    // Load the navbar
    $("#toggle_settings").load("/toggle_settings.html", function() {
        // Once the navbar is loaded, add click event listener
        var userMenuButton = document.getElementById('user-menu-button');
        if (userMenuButton) {
            userMenuButton.addEventListener('click', function() {
                var dropdown = document.getElementById('dropdown-menu');
                if (dropdown) {
                    dropdown.classList.toggle('hidden');
                }
            });
        }
    });

    // Conditionally load the landing banner
    if ($("#landingBanner").length > 0) { // This part checks for whether an id exists in the corresponding file
        $("#landingBanner").load("/landing_banner.html"); // Extremely useful since we just need to add an id to the file where we need the content
    } else if ($("#productGrid").length > 0) {
        $("#productGrid").load("/product_grid.html");
    }
});