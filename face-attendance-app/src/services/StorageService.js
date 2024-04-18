import SecureLS from 'secure-ls';

const ls = new SecureLS({ encodingType: 'aes' });

class StorageService {
    storeItem(itemKey, itemValue) {
        try {
            ls.set(itemKey, itemValue);
        } catch (error) {
            console.error('Error storing user:', error);
        }
    }

    getItem(itemKey) {
        try {
            const user = ls.get(itemKey);
            return user;
        } catch (error) {
            console.error('Error retrieving user:', error);
            return null;
        }
    }
    
    removeItem(itemKey) {
        try {
            ls.remove(itemKey);
        } catch (error) {
            console.error('Error removing user:', error);
        }
    }
}

export default StorageService;