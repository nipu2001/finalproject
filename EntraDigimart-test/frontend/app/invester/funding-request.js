import React, { useEffect, useState, useCallback } from 'react';

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  Linking,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { investorAPI, BASE_URL } from '../../api';
import * as DocumentPicker from 'expo-document-picker';

const FundingRequestScreen = () => {
  const router = useRouter();
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [fundingRequests, setFundingRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [documents, setDocuments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const load = async (opts = {}) => {
    try {
      if (!opts.silent) setLoading(true);
      setError('');
      const data = await investorAPI.listRequests({ status });
      const list = Array.isArray(data) ? data : [];
      setFundingRequests(list);
    } catch (e) {
      setError(e?.error || 'Failed to load requests');
    } finally {
      if (!opts.silent) setLoading(false);
    }
  };

  const deleteDocument = async (doc) => {
    if (!selectedRequest?.id) { Alert.alert('Error', 'Request not selected'); return; }
    const docId = doc?.id || doc?.document_id || doc?.documentId;
    if (!docId) { Alert.alert('Error', 'Document id missing'); return; }
    try {
      Alert.alert('Delete Document', 'Are you sure you want to delete this document?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            try {
              setModalLoading(true);
              await investorAPI.deleteDocument(selectedRequest.id, docId);
              const docs = await investorAPI.listDocuments(selectedRequest.id);
              setDocuments(Array.isArray(docs) ? docs : []);
            } catch (e) {
              const msg = e?.error || e?.message || 'Failed to delete';
              Alert.alert('Error', msg);
            } finally {
              setModalLoading(false);
            }
          }
        }
      ]);
    } catch (e) {
      const msg = e?.error || e?.message || 'Failed to delete';
      Alert.alert('Error', msg);
    }
  };

  const confirmFunding = async (request) => {
    try {
      setError('');
      await investorAPI.updateStatus(request.id, 'funded');
      try {
        await investorAPI.sendMessage(request.id, 'Funds have been transferred.');
      } catch (_) { }
      await load({ silent: true });
      Alert.alert('Success', 'Marked as funded');
    } catch (e) {
      Alert.alert('Error', e?.error || 'Failed to mark funded');
    }
  };

  const uploadAgreementFor = async (request) => {
    if (!request?.id) return;
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
      if (res.canceled) return;
      const asset = res.assets?.[0];
      if (!asset?.uri) return;
      let name = asset.name || asset.originalName;
      if (!name) {
        const parts = String(asset.uri).split(/[\/]/);
        name = parts[parts.length - 1] || 'agreement.pdf';
      }
      if (name && !name.toLowerCase().endsWith('.pdf')) name = `${name}.pdf`;
      const file = { uri: asset.uri, name, mimeType: asset.mimeType || 'application/pdf', type: asset.mimeType || 'application/pdf' };
      setModalLoading(true);
      await investorAPI.uploadAgreement(request.id, file, 'agreement');
      Alert.alert('Uploaded', 'Agreement uploaded successfully');
    } catch (e) {
      const msg = e?.error || e?.message || (typeof e === 'string' ? e : JSON.stringify(e));
      Alert.alert('Error', `Failed to upload: ${msg}`);
    } finally {
      setModalLoading(false);
    }
  };

  function getBaseHost() {
    try {
      // BASE_URL like http://host:port/api -> strip trailing /api
      return String(BASE_URL).replace(/\/?api\/?$/, '');
    } catch {
      return '';
    }
  }

  function getDocumentUrl(doc) {
    // Prefer API download endpoint if we have IDs
    if (selectedRequest?.id && doc?.id) {
      const host = getBaseHost();
  return `${host}/api/invester/requests/${selectedRequest.id}/documents/${doc.id}/download`;
    }
    const direct = doc?.url || doc?.file_url || doc?.fileUrl || doc?.document_url || doc?.download_url;
    if (direct) return direct;
    let p = doc?.file_path || doc?.filePath || doc?.path || doc?.file || doc?.location;
    if (!p) return '';
    // Normalize backslashes to forward slashes (in case backend returns Windows paths)
    p = String(p).replace(/\\/g, '/');
    // If path contains an 'uploads' segment, map to public URL base
    const idx = p.toLowerCase().lastIndexOf('/uploads');
    if (idx !== -1) {
      const sub = p.slice(idx); // starts with /uploads
      const host = getBaseHost();
      return `${host}${sub}`;
    }
    // If already absolute
    if (/^https?:\/\//i.test(p)) return p;
    const host = getBaseHost();
    // Ensure leading slash on path
    const path = p.startsWith('/') ? p : `/${p}`;
    return `${host}${path}`;
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load({ silent: true });
    setRefreshing(false);
  }, [status]);

  const handleNavigate = (path) => {
    if (path === null) return;
    if (path === 'back') {
      router.back();
    } else {
      router.push(path);
    }
  };

  const handleViewProfile = async (request) => {
    try {
      let eid = request?.entrepreneur_id;
      if (!eid) {
        const detail = await investorAPI.getRequest(request.id);
        const req = detail?.request || detail;
        eid = req?.entrepreneur_id;
      }
      if (!eid) throw new Error('Entrepreneur not found');
  handleNavigate(`/invester/entrepreneur/${eid}`);
    } catch (e) {
      Alert.alert('Error', e?.error || e.message || 'Failed to open profile');
    }
  };

  const openDetail = (request) => {
  handleNavigate(`/invester/requests/${request.id}`);
  };

  const openChat = async (request) => {
    try {
      setSelectedRequest(request);
      setChatOpen(true);
      setModalLoading(true);
      const msgs = await investorAPI.listMessages(request.id);
      setMessages(Array.isArray(msgs) ? msgs : []);
    } catch (e) {
      Alert.alert('Error', e?.error || 'Failed to load messages');
      setChatOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  const sendMsg = async () => {
    if (!message.trim() || !selectedRequest) return;
    try {
      setModalLoading(true);
      await investorAPI.sendMessage(selectedRequest.id, message.trim());
      setMessage('');
      const msgs = await investorAPI.listMessages(selectedRequest.id);
      setMessages(Array.isArray(msgs) ? msgs : []);
    } catch (e) {
      Alert.alert('Error', e?.error || 'Failed to send message');
    } finally {
      setModalLoading(false);
    }
  };

  const openDocs = async (request) => {
    try {
      setSelectedRequest(request);
      setDocsOpen(true);
      setModalLoading(true);
      const docs = await investorAPI.listDocuments(request.id);
      setDocuments(Array.isArray(docs) ? docs : []);
    } catch (e) {
      Alert.alert('Error', e?.error || 'Failed to load documents');
      setDocsOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  const uploadAgreementInline = async () => {
    if (!selectedRequest) return;
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
      if (res.canceled) return;
      const asset = res.assets?.[0];
      if (!asset?.uri) return;
      // Ensure filename and mimetype are present
      let name = asset.name || asset.originalName;
      if (!name) {
        const parts = String(asset.uri).split(/[\/]/);
        name = parts[parts.length - 1] || 'agreement.pdf';
      }
      if (name && !name.toLowerCase().endsWith('.pdf')) name = `${name}.pdf`;
      const file = { uri: asset.uri, name, mimeType: asset.mimeType || 'application/pdf', type: asset.mimeType || 'application/pdf' };
      setModalLoading(true);
      await investorAPI.uploadAgreement(selectedRequest.id, file, 'agreement');
      const docs = await investorAPI.listDocuments(selectedRequest.id);
      setDocuments(Array.isArray(docs) ? docs : []);
      const msgs = await investorAPI.listMessages(selectedRequest.id);
      setMessages(Array.isArray(msgs) ? msgs : []);
      Alert.alert('Uploaded', 'Agreement uploaded successfully');
    } catch (e) {
      const msg = e?.error || e?.message || (typeof e === 'string' ? e : JSON.stringify(e));
      Alert.alert('Error', `Failed to upload: ${msg}`);
    } finally {
      setModalLoading(false);
    }
  };

  const viewDocument = async (doc) => {
    const url = getDocumentUrl(doc);
    if (!url) {
      Alert.alert('Unavailable', 'Document URL not available');
      return;
    }
    try {
      await Linking.openURL(url);
    } catch (_) {
      Alert.alert('Error', 'Unable to open document');
    }
  };

  const shareDocument = async (doc) => {
    const url = getDocumentUrl(doc);
    const name = doc?.file_name || doc?.fileName || 'document.pdf';
    if (!url) {
      Alert.alert('Unavailable', 'Document URL not available');
      return;
    }
    try {
      await Share.share({ message: `Document: ${name}\n${url}`, url, title: name });
    } catch (e) {
      Alert.alert('Error', e?.message || 'Unable to share document');
    }
  };

  const totalAsked = fundingRequests.reduce((sum, r) => sum + parseFloat(r.funding_amount || 0), 0);

  const doUpdateStatus = async (request, nextStatus) => {
    try {
      setError('');
      await investorAPI.updateStatus(request.id, nextStatus);
      if (nextStatus === 'approved') setStatus('approved');
      try {
        const msg = nextStatus === 'approved'
          ? 'Your funding request has been approved. You can chat here for next steps.'
          : nextStatus === 'rejected'
            ? 'Your funding request has been rejected.'
            : `Your funding request status changed to ${nextStatus}.`;
        await investorAPI.sendMessage(request.id, msg);
      } catch (_) { }
      await load({ silent: true });
      Alert.alert('Success', `Request ${nextStatus}`);
    } catch (e) {
      Alert.alert('Error', e?.error || 'Failed to update');
    }
  };

  const RequestCard = ({ request }) => (
    <View style={styles.requestCard}>
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {/* Header with Avatar and Name */}
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: request.avatar || 'https://via.placeholder.com/100' }}
              style={styles.avatar}
            />
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
            </View>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.entrepreneurName}>{request.entrepreneur_name || 'Entrepreneur'}</Text>
            <Text style={styles.businessName}>{request.business_name}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{request.category || 'Investment'}</Text>
            </View>
          </View>
          <View style={styles.fundingBadge}>
            <Text style={styles.fundingAmount}>LKR {formatAmount(request.funding_amount)}</Text>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.description}>{request.business_description || 'No description'}</Text>

        {/* Date */}
        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={14} color="#64748b" />
          <Text style={styles.dateText}>Requested: {new Date(request.created_at).toLocaleDateString()}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => handleViewProfile(request)}
          >
            <LinearGradient
              colors={['#3b82f6', '#2563eb']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="person-outline" size={18} color="white" />
              <Text style={styles.buttonText}>View Profile</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => openChat(request)}
          >
            <Ionicons name="chatbubble-outline" size={18} color="#3b82f6" />
            <Text style={styles.secondaryButtonText}>Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => openDocs(request)}
          >
            <Ionicons name="document-text-outline" size={18} color="#22c55e" />
            <Text style={styles.secondaryButtonText}>Docs</Text>
          </TouchableOpacity>
        </View>

        {String(request.status).toLowerCase() === 'pending' && (
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            <TouchableOpacity onPress={() => doUpdateStatus(request, 'approved')} style={{ flex: 1, backgroundColor: '#10b981', paddingVertical: 10, borderRadius: 10, alignItems: 'center' }}>
              <Text style={{ color: 'white', fontWeight: '600' }}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => doUpdateStatus(request, 'rejected')} style={{ flex: 1, backgroundColor: '#ef4444', paddingVertical: 10, borderRadius: 10, alignItems: 'center' }}>
              <Text style={{ color: 'white', fontWeight: '600' }}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
        {String(request.status).toLowerCase() === 'approved' && (request.admin_approved || request.adminApproved) && (
          <View style={{ marginTop: 10, backgroundColor: '#f8fafc', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#e2e8f0' }}>
            <Text style={{ color: '#111827', fontWeight: '700', marginBottom: 6 }}>Funding Instructions</Text>
            <Text style={{ color: '#374151' }}>
              This request has been approved. Please proceed with a manual bank transfer using the entrepreneur's verified bank details. Upload the payment proof in the request documents or chat with the entrepreneur for next steps.
            </Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <LinearGradient
          colors={['#22c55e', '#3b82f6']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => handleNavigate('back')}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Funding Requests</Text>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{fundingRequests.length}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Status Filter */}
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            {['pending', 'approved', 'rejected', 'funded'].map(s => (
              <TouchableOpacity key={s} onPress={() => setStatus(s)} style={{
                paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, marginRight: 8,
                backgroundColor: status === s ? '#fb923c' : '#e5e7eb'
              }}>
                <Text style={{ color: status === s ? 'white' : '#374151' }}>{capitalize(s)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Stats Overview */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{fundingRequests.length}</Text>
              <Text style={styles.statLabel}>New Requests</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>LKR {formatAmount(totalAsked)}</Text>
              <Text style={styles.statLabel}>Total Asked</Text>
            </View>
          </View>

          {/* Requests List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Incoming Requests</Text>
            {loading ? (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <ActivityIndicator color="#fb923c" />
              </View>
            ) : (
              fundingRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))
            )}
            {!loading && fundingRequests.length === 0 && (
              <Text style={{ color: '#64748b', marginTop: 8 }}>No {status} requests</Text>
            )}
            {!!error && (
              <Text style={{ color: '#ef4444', marginTop: 8 }}>{error}</Text>
            )}
          </View>
        </View>
      </ScrollView>
      {/* Chat Modal */}
      <Modal visible={chatOpen} animationType="slide" transparent onRequestClose={() => setChatOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chat</Text>
              <TouchableOpacity onPress={() => setChatOpen(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              {modalLoading && <ActivityIndicator color="#fb923c" />}
              {messages.map((m) => (
                <View key={m.id} style={{ marginBottom: 8 }}>
                  <Text style={{ color: '#111827' }}>{m.message}</Text>
                  <Text style={{ color: '#9ca3af', fontSize: 12 }}>{new Date(m.created_at).toLocaleString()}</Text>
                </View>
              ))}
              {messages.length === 0 && !modalLoading && (
                <Text style={{ color: '#6b7280' }}>No messages</Text>
              )}
            </ScrollView>
            <View style={{ flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb' }}>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Write a message"
                style={{ flex: 1, backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }}
              />
              <TouchableOpacity disabled={modalLoading} onPress={sendMsg} style={{ marginLeft: 8, backgroundColor: '#fb923c', borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center' }}>
                <Text style={{ color: 'white', fontWeight: '600' }}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Documents Modal */}
      <Modal visible={docsOpen} animationType="slide" transparent onRequestClose={() => setDocsOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Documents</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <TouchableOpacity onPress={() => setDocsOpen(false)}>
                  <Text style={{ color: '#64748b', fontWeight: '600' }}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setDocsOpen(false)}>
                  <Ionicons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView style={styles.modalBody}>
              {documents.length === 0 ? (
                <TouchableOpacity onPress={uploadAgreementInline} style={{ backgroundColor: '#111827', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ color: 'white', fontWeight: '600' }}>Upload Final Agreement (PDF)</Text>
                </TouchableOpacity>
              ) : (
                <Text style={{ color: '#6b7280', marginBottom: 12 }}>A final agreement has been uploaded. Upload is disabled.</Text>
              )}
              {modalLoading && <ActivityIndicator color="#fb923c" />}
              {documents.map((d) => {
                const key = String(d.id || d.document_id || d.documentId || d.file_name || Math.random());
                return (
                  <View key={key} style={{ backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, marginBottom: 10 }}>
                    <Text style={{ color: '#111827', fontWeight: '700', marginBottom: 4 }}>{d.file_name || d.fileName}</Text>
                    <Text style={{ color: '#6b7280', fontSize: 12, marginBottom: 10 }}>
                      {(d.document_type || d.documentType || 'other').toUpperCase()} • {(d.created_at || d.uploaded_at) ? new Date(d.created_at || d.uploaded_at).toLocaleString() : ''}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity onPress={() => viewDocument(d)} style={{ flex: 1, backgroundColor: 'white', borderColor: '#e2e8f0', borderWidth: 1.5, paddingVertical: 10, borderRadius: 10, alignItems: 'center' }}>
                        <Text style={{ color: '#374151', fontWeight: '600' }}>View</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => shareDocument(d)} style={{ flex: 1, backgroundColor: '#3b82f6', paddingVertical: 10, borderRadius: 10, alignItems: 'center' }}>
                        <Text style={{ color: 'white', fontWeight: '600' }}>Share</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
              {documents.length === 0 && !modalLoading && (
                <Text style={{ color: '#6b7280' }}>No documents</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Profile Modal */}
      <Modal visible={profileOpen} animationType="slide" transparent onRequestClose={() => setProfileOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Entrepreneur Profile</Text>
              <TouchableOpacity onPress={() => setProfileOpen(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              {modalLoading && <ActivityIndicator color="#fb923c" />}
              {profile && (
                <View>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 }}>{profile.name}</Text>
                  <Text style={{ color: '#374151', marginBottom: 2 }}>Email: {profile.email || '-'}</Text>
                  <Text style={{ color: '#374151', marginBottom: 2 }}>Phone: {profile.phone || '-'}</Text>
                  <Text style={{ color: '#374151', marginBottom: 2 }}>Address: {profile.address || '-'}</Text>
                  <Text style={{ color: '#6b7280', marginTop: 6, fontSize: 12 }}>Joined: {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '-'}</Text>
                </View>
              )}
              {!modalLoading && !profile && (
                <Text style={{ color: '#6b7280' }}>No profile found</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
      {(loading || modalLoading) && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', borderRadius: 16, paddingVertical: 20, paddingHorizontal: 24, alignItems: 'center', minWidth: 220 }}>
            <ActivityIndicator size="large" color="#fb923c" />
            <Text style={{ marginTop: 10, fontWeight: '700', color: '#111827' }}>Please wait...</Text>
            <Text style={{ marginTop: 2, color: '#6b7280', fontSize: 12 }}>Processing your request</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingVertical: 20, paddingHorizontal: 16 },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  backButton: { padding: 8 },
  headerTitle: { flex: 1, textAlign: 'center', color: 'white', fontSize: 20, fontWeight: 'bold' },
  headerBadge: { backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  headerBadgeText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  content: { padding: 16 },
  statsContainer: { flexDirection: 'row', marginBottom: 24, gap: 12 },
  statCard: { flex: 1, backgroundColor: 'white', padding: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#3b82f6', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#64748b' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#1e293b' },
  requestCard: { marginBottom: 16, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  cardGradient: { padding: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  avatarContainer: { position: 'relative', marginRight: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 3, borderColor: 'white' },
  statusBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: 'white', borderRadius: 10, padding: 2 },
  statusDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#22c55e' },
  headerInfo: { flex: 1 },
  entrepreneurName: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 2 },
  businessName: { fontSize: 14, color: '#64748b', marginBottom: 6 },
  categoryBadge: { backgroundColor: '#e0f2fe', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  categoryText: { fontSize: 12, color: '#0284c7', fontWeight: '600' },
  fundingBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  fundingAmount: { fontSize: 16, fontWeight: 'bold', color: '#16a34a' },
  description: { fontSize: 14, color: '#475569', lineHeight: 20, marginBottom: 12 },
  dateContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dateText: { fontSize: 12, color: '#64748b', marginLeft: 4 },
  actionButtons: { flexDirection: 'row', gap: 8 },
  primaryButton: { flex: 1, borderRadius: 10, overflow: 'hidden' },
  buttonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 6 },
  buttonText: { color: 'white', fontWeight: '600', fontSize: 14 },
  secondaryButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, backgroundColor: 'white', borderRadius: 10, borderWidth: 1.5, borderColor: '#e2e8f0', gap: 6 },
  secondaryButtonText: { color: '#475569', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  modalBody: { padding: 20 },
});

export default FundingRequestScreen;

function formatAmount(n) {
  const num = parseFloat(n || 0);
  return Number.isFinite(num) ? num.toLocaleString() : '0';
}

function capitalize(s) {
  return (s || '').charAt(0).toUpperCase() + (s || '').slice(1);
}