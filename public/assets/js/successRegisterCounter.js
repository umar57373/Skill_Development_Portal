document.addEventListener('DOMContentLoaded', () => {
    let countdown = 10;
    const countdownElement = document.getElementById('countdown');

    const updateCountdown = () => {
        countdownElement.textContent = `You will be redirected to the login page in ${countdown} seconds.`;
        countdown--;

        if (countdown < 0) {
            window.location.href = '/login';
        } else {
            setTimeout(updateCountdown, 1000);
        }
    };

    updateCountdown();
});