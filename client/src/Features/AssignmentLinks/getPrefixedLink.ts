export const getPrefixedLink = (url: string): string => (!url.match(/^[a-zA-Z]+:\/\//) ? `https://${url}` : url);
