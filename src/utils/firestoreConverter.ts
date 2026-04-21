import { 
  FirestoreDataConverter, 
  QueryDocumentSnapshot, 
  SnapshotOptions, 
  Timestamp, 
  serverTimestamp 
} from 'firebase/firestore';

/**
 * Strips undefined values from an object recursively.
 * Firestore rejects undefined values, so we must clean the data before writing.
 */
export const stripUndefined = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  
  const newObj: any = Array.isArray(obj) ? [] : {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (value !== undefined) {
        newObj[key] = stripUndefined(value);
      }
    }
  }
  
  return newObj;
};

/**
 * Generic Firestore Data Converter that handles Timestamp <-> Date/String conversions.
 * It also automatically handles document IDs and strips undefined values on write.
 */
export const createConverter = <T extends object>(): FirestoreDataConverter<T> => ({
  toFirestore: (data: T) => {
    const cleaned = stripUndefined(data);
    
    // Remove the 'id' field before writing as it's the document key if present
    const { id, ...docData } = cleaned as any;
    
    return docData;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): T => {
    const data = snapshot.data(options);
    
    // Helper to recursively convert Timestamps to ISO Strings or Dates
    const convertTimestamps = (obj: any): any => {
      if (obj === null || typeof obj !== 'object') return obj;
      
      if (obj instanceof Timestamp) {
        return obj.toDate().toISOString();
      }
      
      const newObj: any = Array.isArray(obj) ? [] : {};
      for (const key in obj) {
        newObj[key] = convertTimestamps(obj[key]);
      }
      return newObj;
    };
    
    return {
      ...convertTimestamps(data),
      id: snapshot.id
    } as any as T;
  }
});
