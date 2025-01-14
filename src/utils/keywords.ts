export const generateKeywords = (name: string): string[] => {
    name = name.toLowerCase();
    const arrName: string[] = [];
    let curName = name.slice(0, 2);
    name.slice(2).split('').forEach((letter) => {
        curName += letter;
        arrName.push(curName);
    });
    return arrName;
};

export const generateUserKeywords = (user: { firstName: string, lastName?: string, username: string }): string[] => {
    if (!user) {
        return;
    }

    const result: Set<string> = new Set();

    if (user.lastName && user.lastName.length) {
        generateKeywords(user.firstName + ' ' + user.lastName).forEach((keyword) => result.add(keyword));
        generateKeywords(user.lastName + ' ' + user.firstName).forEach((keyword) => result.add(keyword));
    } else {
        generateKeywords(user.firstName).forEach((keyword) => result.add(keyword));
    }

    generateKeywords(user.username).forEach((keyword) => result.add(keyword));

    return Array.from(result);
}

// console.log("John Doe: ", generateUserKeywords({ firstName: 'John', lastName: 'Doe', username: 'johndoe' }));
// console.log("John", generateKeywords("John"));
// onMounted(async () => {
//   const userRefs = await getDocs(collection(db, "users"))
//   await Promise.all(userRefs.docs.map(async doc => {
//     await updateDoc(doc.ref, {
//       "keywords": generateUserKeywords(doc.data())
//     });
//   }));
// })