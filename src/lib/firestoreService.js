import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  writeBatch 
} from 'firebase/firestore';

export const getAllDocuments = async (collectionName) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error);
    throw error;
  }
};

export const getDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error(`Error getting document ${docId} from ${collectionName}:`, error);
    throw error;
  }
};

export const addDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
};

export const setDocument = async (collectionName, docId, data) => {
  try {
    await setDoc(doc(db, collectionName, docId), data, { merge: true });
    return { id: docId, ...data };
  } catch (error) {
    console.error(`Error setting document ${docId} in ${collectionName}:`, error);
    throw error;
  }
};

export const updateDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, data);
    return { id: docId, ...data };
  } catch (error) {
    console.error(`Error updating document ${docId} in ${collectionName}:`, error);
    throw error;
  }
};

export const deleteDocument = async (collectionName, docId) => {
  try {
    await deleteDoc(doc(db, collectionName, docId));
    return true;
  } catch (error) {
    console.error(`Error deleting document ${docId} from ${collectionName}:`, error);
    throw error;
  }
};

export const queryDocuments = async (collectionName, conditions = []) => {
  try {
    let q = collection(db, collectionName);
    conditions.forEach(c => {
      if (c.type === 'where') q = query(q, where(c.field, c.operator, c.value));
      if (c.type === 'orderBy') q = query(q, orderBy(c.field, c.direction));
      if (c.type === 'limit') q = query(q, limit(c.value));
    });
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error querying documents in ${collectionName}:`, error);
    throw error;
  }
};

export const listenToCollection = (collectionName, callback) => {
  const q = collection(db, collectionName);
  return onSnapshot(q, (querySnapshot) => {
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  }, (error) => {
    console.error(`Listen error in ${collectionName}:`, error);
  });
};

export const listenToDocument = (collectionName, docId, callback) => {
  const docRef = doc(db, collectionName, docId);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() });
    } else {
      callback(null);
    }
  }, (error) => {
    console.error(`Listen error for ${docId} in ${collectionName}:`, error);
  });
};

export const batchWrite = async (operations) => {
  try {
    const batch = writeBatch(db);
    operations.forEach(op => {
      const docRef = doc(db, op.collection, op.id);
      if (op.type === 'set') batch.set(docRef, op.data, { merge: true });
      if (op.type === 'update') batch.update(docRef, op.data);
      if (op.type === 'delete') batch.delete(docRef);
    });
    await batch.commit();
    return true;
  } catch (error) {
    console.error('Batch write error:', error);
    throw error;
  }
};