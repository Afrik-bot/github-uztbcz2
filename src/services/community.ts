import { 
  doc, 
  setDoc, 
  deleteDoc, 
  getDoc, 
  updateDoc, 
  increment,
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { nanoid } from 'nanoid';
import { db, auth } from '../lib/firebase';

export async function joinCommunity(communityId: string) {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be logged in to join communities');

  const membershipId = `${communityId}_${user.uid}`;
  const membershipRef = doc(db, 'community_members', membershipId);
  const communityRef = doc(db, 'communities', communityId);

  try {
    await runTransaction(db, async (transaction) => {
      // Check if membership already exists
      const membershipDoc = await transaction.get(membershipRef);
      if (membershipDoc.exists()) {
        throw new Error('Already a member of this community');
      }

      // Create membership document
      transaction.set(membershipRef, {
        userId: user.uid,
        communityId,
        joinedAt: serverTimestamp(),
        status: 'active',
        membershipId: nanoid()
      });

      // Update community member count
      transaction.update(communityRef, {
        memberCount: increment(1),
        updatedAt: serverTimestamp()
      });
    });

    return true;
  } catch (error: any) {
    console.error('Error joining community:', error);
    throw new Error(error.message || 'Failed to join community');
  }
}

export async function leaveCommunity(communityId: string) {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be logged in to leave communities');

  const membershipId = `${communityId}_${user.uid}`;
  const membershipRef = doc(db, 'community_members', membershipId);
  const communityRef = doc(db, 'communities', communityId);

  try {
    await runTransaction(db, async (transaction) => {
      // Check if membership exists
      const membershipDoc = await transaction.get(membershipRef);
      if (!membershipDoc.exists()) {
        throw new Error('Not a member of this community');
      }

      // Delete membership document
      transaction.delete(membershipRef);

      // Update community member count
      transaction.update(communityRef, {
        memberCount: increment(-1),
        updatedAt: serverTimestamp()
      });
    });

    return true;
  } catch (error: any) {
    console.error('Error leaving community:', error);
    throw new Error(error.message || 'Failed to leave community');
  }
}

export async function checkMembership(communityId: string): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;

  try {
    const membershipId = `${communityId}_${user.uid}`;
    const membershipRef = doc(db, 'community_members', membershipId);
    const membership = await getDoc(membershipRef);
    
    return membership.exists();
  } catch (error) {
    console.error('Error checking membership:', error);
    return false;
  }
}