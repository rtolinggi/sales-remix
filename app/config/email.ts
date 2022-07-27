export const bodyEmail = (link: string): string => {
  return `
    <h1>Verified Email</h1>
    <p><b> Click link Bottom </b></p>
    <a href="${link}">Activate</a>
    `;
};
