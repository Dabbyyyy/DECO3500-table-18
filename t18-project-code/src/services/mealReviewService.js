// IndexedDB stores the photo Blob locally without putting large images in localStorage or Firebase.
export function saveMealReview(review) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("ktchn-meal-reviews", 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore("reviews", { keyPath: "id" });
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("Review storage is blocked by another tab."));
    request.onsuccess = () => {
      const database = request.result;
      try {
        const transaction = database.transaction("reviews", "readwrite");
        transaction.objectStore("reviews").put(review);
        transaction.oncomplete = () => { database.close(); resolve(review.id); };
        transaction.onerror = () => { database.close(); reject(transaction.error); };
        transaction.onabort = () => { database.close(); reject(transaction.error || new Error("Review save was canceled.")); };
      } catch (error) { database.close(); reject(error); }
    };
  });
}