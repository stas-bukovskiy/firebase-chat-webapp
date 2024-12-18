export function validateEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
}

export function containsUppercase(password) {
    const uppercasePattern = /[A-Z]/;
    return uppercasePattern.test(password);
}

export function containerLowercase(password) {
    const uppercasePattern = /[a-z]/;
    return uppercasePattern.test(password);
}