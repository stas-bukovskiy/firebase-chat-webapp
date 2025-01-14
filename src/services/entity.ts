interface EntityInterface {
    id: string;
    createdAt: number;
}

export default class Entity implements EntityInterface {

    /**
     * Create a FirestoreDataConverter
     */
    public static get converter() {
        return {
            fromFirestore: <T extends Model>(snapshot: FirebaseFirestore.QueryDocumentSnapshot): T => {
                return this.fromFirestore(snapshot) as T
            },
            toFirestore: <T extends Model>(model: T): FirebaseFirestore.DocumentData => {
                return this.toFirestore(model)
            },
        }
    }

    /**
     * Convert the data from Firestore to match the Model constructor.
     */
    private static fromFirestore<T extends Model>(snapshot: FirebaseFirestore.DocumentSnapshot): T {
        const transformed = this.transformFromFirestore(snapshot.data() as FirebaseFirestore.DocumentSnapshot)

        const createdAt = snapshot["_document"].createTime.timestamp.seconds;
        const addons = {
            id: snapshot.id,
            createdAt: createdAt
        }

        return {
            ...transformed,
            ...addons,
        } as T
    }

    /**
     * Convert the Model before be saved to Firestore.
     */
    private static toFirestore<T extends Model>(model: T): Record<string, any> {
        const transformed = this.transformToFirestore(model)
        const filtered = _.omit(transformed, ['id', 'createdAt'])

        return {...filtered}
    }

    /**
     * Convert the data from Firestore to match the Model constructor.
     * This method can be overriden by a sub-class.
     */
    protected static transformFromFirestore(data: FirebaseFirestore.DocumentData): Record<string, any> {
        return data
    }

    /**
     * Convert the Model before be saved to Firestore.
     * This method can be overriden by a sub-class.
     */
    protected static transformToFirestore<T extends Model>(model: T): Record<string, any> {
        return model
    }

}