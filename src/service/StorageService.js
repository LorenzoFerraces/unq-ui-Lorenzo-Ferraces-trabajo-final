export const getItem = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error getting item from storage with key ${key}:`, error);
    return null;
  }
};

export const setItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error setting item in storage with key ${key}:`, error);
    return false;
  }
};

export const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing item from storage with key ${key}:`, error);
    return false;
  }
};

export const clear = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error("Error clearing storage:", error);
    return false;
  }
};

export const hasItem = (key) => {
  return localStorage.getItem(key) !== null;
};

export const getAllKeys = () => {
  try {
    return Object.keys(localStorage);
  } catch (error) {
    console.error("Error getting all keys from storage:", error);
    return [];
  }
};
