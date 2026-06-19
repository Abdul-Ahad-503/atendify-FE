import { Colors, Spacing, Typography } from "@/constants/theme";
import {
  AddMeetingRequest,
  apiClient,
  authApi,
  User,
} from "@/utils/api";
import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DAYS_OF_WEEK = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
];
const TIME_SLOTS = [1, 2, 3, 4, 5, 6, 7, 8];
const SECTION_OPTIONS = ["A", "B", "C"];

const SLOT_TIMES: Record<number, { start: string; end: string }> = {
  1: { start: "08:30", end: "09:20" },
  2: { start: "09:30", end: "10:20" },
  3: { start: "10:30", end: "11:20" },
  4: { start: "11:30", end: "12:20" },
  5: { start: "12:30", end: "13:20" },
  6: { start: "14:10", end: "15:00" },
  7: { start: "15:00", end: "15:50" },
  8: { start: "15:50", end: "16:40" },
};

interface Term { _id: string; name: string; isActive: boolean; }
interface Program { _id: string; name: string; code: string; }

export default function AddCourseOfferingScreen() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "success">("form");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [terms, setTerms] = useState<Term[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);

  // Form
  const [selectedTermId, setSelectedTermId] = useState("");
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [section, setSection] = useState("");
  const [courseName, setCourseName] = useState("");
  const [creditHours, setCreditHours] = useState<number | null>(null);
  const [meetings, setMeetings] = useState<AddMeetingRequest[]>([]);

  // Meeting modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [curMeeting, setCurMeeting] = useState<AddMeetingRequest>({
    day: "Monday", slot: 1, roomNo: "", timeStart: "08:30", timeEnd: "09:20",
  });

  useFocusEffect(
    useCallback(() => { loadData(); }, []),
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const [userData, termsRes, progRes] = await Promise.all([
        authApi.getMe(),
        apiClient.get("/terms"),
        apiClient.get("/programs"),
      ]);
      setUser(userData);
      const termsList: Term[] = termsRes.data?.data?.terms || [];
      if (termsList.length > 0) {
        setTerms(termsList);
        const act = termsList.find((t: Term) => t.isActive) || termsList[0];
        if (act) setSelectedTermId(act._id);
      } else {
        setTerms([
          { _id: "spring2026", name: "Spring 2026", isActive: true },
          { _id: "fall2025", name: "Fall 2025", isActive: false },
        ]);
      }
      setPrograms(progRes.data?.data?.programs || []);
    } catch (_) {
      setTerms([
        { _id: "spring2026", name: "Spring 2026", isActive: true },
        { _id: "fall2025", name: "Fall 2025", isActive: false },
      ]);
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  // useFocusEffect handles load on mount

  const calcTime = (slot: number, dur: 1 | 3) => {
    const s = SLOT_TIMES[slot];
    if (!s) return { timeStart: "08:30", timeEnd: "09:20" };
    if (dur === 1) return { timeStart: s.start, timeEnd: s.end };
    const e = SLOT_TIMES[slot + 2];
    return { timeStart: s.start, timeEnd: e ? e.end : s.end };
  };

  const requiredMeetings = creditHours || 0;
  const allMeetingsAdded = meetings.length === requiredMeetings && meetings.length > 0;

  const validate = (): string | null => {
    if (!selectedTermId) return "Please select a term";
    if (!selectedProgramId) return "Please select a program";
    if (!selectedSemester) return "Please select a semester";
    if (!section) return "Please select a section";
    if (!courseName.trim()) return "Please enter course name";
    if (!creditHours || creditHours < 1) return "Enter valid credit hours";
    if (meetings.length < requiredMeetings) return `Add ${requiredMeetings - meetings.length} more meeting(s)`;
    for (const m of meetings) {
      if (!m.roomNo.trim()) return "All meetings need a room number";
    }
    return null;
  };

  const handlePublish = async () => {
    const err = validate();
    if (err) { Alert.alert("Validation", err); return; }
    setSubmitting(true);
    try {
      // Create offering
      const offeringRes = await apiClient.post("/teacher/offerings", {
        termId: selectedTermId,
        programId: selectedProgramId,
        semester: selectedSemester,
        section,
        courseName: courseName.trim(),
        creditHours: creditHours!,
        departmentId: user?.department || "",
      });
      const offering = offeringRes.data.data?.offering || offeringRes.data.data;
      const offeringId = offering._id || offering.id;

      // Add meetings
      for (let i = 0; i < meetings.length; i++) {
        await apiClient.post(`/teacher/offerings/${offeringId}/meetings`, meetings[i]);
      }

      // Publish
      await apiClient.patch(`/teacher/offerings/${offeringId}/publish`);

      setStep("success");
      Alert.alert("Success", "Course offering published!");
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.message || e.message || "Failed to create offering");
    } finally {
      setSubmitting(false);
    }
  };

  const openAddMeeting = () => {
    if (!courseName.trim() || !creditHours) {
      Alert.alert("Required", "Enter course name and credit hours first");
      return;
    }
    if (meetings.length >= requiredMeetings) {
      Alert.alert("Limit Reached", `This ${requiredMeetings}-credit course needs exactly ${requiredMeetings} meetings`);
      return;
    }
    setCurMeeting({ day: "Monday", slot: 1, roomNo: "", timeStart: "08:30", timeEnd: "09:20" });
    setEditIndex(null);
    setModalVisible(true);
  };

  const saveMeeting = () => {
    if (!curMeeting.roomNo.trim()) { Alert.alert("Required", "Enter room number"); return; }
    if (editIndex !== null) {
      const upd = [...meetings]; upd[editIndex] = curMeeting; setMeetings(upd);
    } else {
      setMeetings([...meetings, curMeeting]);
    }
    setModalVisible(false);
  };

  const deleteMeeting = (idx: number) =>
    Alert.alert("Delete Meeting", "Remove this meeting?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => setMeetings(meetings.filter((_, i) => i !== idx)) },
    ]);

  if (step === "success") {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.center}>
          <MaterialIcons name="check-circle" size={80} color={Colors.success} />
          <Text style={s.successTitle}>Offering Published!</Text>
          <Text style={s.successMsg}>Your course offering is now visible to students.</Text>
          <TouchableOpacity style={s.primaryBtn} onPress={() => router.back()}>
            <Text style={s.primaryBtnText}>Return to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Add Course Offering</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        {/* Offering Details */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>Offering Details</Text>

          <Field label="Term">
            <View style={s.pickerBox}>
              <Picker selectedValue={selectedTermId} onValueChange={setSelectedTermId} style={s.picker}>
                <Picker.Item label="Select Term" value="" />
                {terms.map(t => <Picker.Item key={t._id} label={`${t.name}${t.isActive ? " (Active)" : ""}`} value={t._id} />)}
              </Picker>
            </View>
          </Field>

          <Field label="Program">
            <View style={s.pickerBox}>
              <Picker selectedValue={selectedProgramId} onValueChange={setSelectedProgramId} style={s.picker}>
                <Picker.Item label="Select Program" value="" />
                {programs.map(p => <Picker.Item key={p._id} label={`${p.name} (${p.code})`} value={p._id} />)}
              </Picker>
            </View>
          </Field>

          <Field label="Semester">
            <View style={s.pickerBox}>
              <Picker selectedValue={selectedSemester} onValueChange={(v: number) => setSelectedSemester(Number(v))} style={s.picker}>
                {[1,2,3,4,5,6,7,8].map(sem => <Picker.Item key={sem} label={`Semester ${sem}`} value={sem} />)}
              </Picker>
            </View>
          </Field>

          <Field label="Section">
            <View style={s.pickerBox}>
              <Picker selectedValue={section} onValueChange={setSection} style={s.picker}>
                <Picker.Item label="Select Section" value="" />
                {SECTION_OPTIONS.map(sec => <Picker.Item key={sec} label={sec} value={sec} />)}
              </Picker>
            </View>
          </Field>

          <Field label="Course Name">
            <TextInput
              style={s.input}
              placeholder="e.g. Data Structures"
              placeholderTextColor={Colors.textSecondary}
              value={courseName}
              onChangeText={setCourseName}
              autoCapitalize="words"
            />
          </Field>

          <Field label="Credit Hours">
            <TextInput
              style={s.input}
              placeholder="e.g. 3"
              placeholderTextColor={Colors.textSecondary}
              value={creditHours !== null ? String(creditHours) : ""}
              onChangeText={v => setCreditHours(v ? Number(v) : null)}
              keyboardType="number-pad"
              maxLength={1}
            />
          </Field>

          {creditHours !== null && (
            <Text style={s.hint}>This course requires {creditHours} meeting(s).</Text>
          )}
        </View>

        {/* Meetings */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.sectionTitle}>Meetings</Text>
            {creditHours !== null && (
              <Text style={s.count}>{meetings.length}/{requiredMeetings}</Text>
            )}
          </View>

          {meetings.map((m, i) => (
            <View key={i} style={s.meetingRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.meetingDay}>{m.day}</Text>
                <Text style={s.meetingMeta}>Slot {m.slot} • Room {m.roomNo}</Text>
                <Text style={s.meetingMeta}>{m.timeStart} - {m.timeEnd}</Text>
              </View>
              <TouchableOpacity onPress={() => { setCurMeeting(m); setEditIndex(i); setModalVisible(true); }}>
                <MaterialIcons name="edit" size={20} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteMeeting(i)}>
                <MaterialIcons name="delete" size={20} color={Colors.error} />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            style={[s.addBtn, (creditHours === null || meetings.length >= requiredMeetings) && s.addBtnDisabled]}
            onPress={openAddMeeting}
            disabled={creditHours === null || meetings.length >= requiredMeetings}
          >
            <MaterialIcons name="add" size={20} color="#fff" />
            <Text style={s.addBtnText}>Add Meeting</Text>
          </TouchableOpacity>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[s.publishBtn, (submitting || !allMeetingsAdded) && s.publishBtnDisabled]}
          onPress={handlePublish}
          disabled={submitting || !allMeetingsAdded}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <MaterialIcons name="publish" size={20} color="#fff" />
              <Text style={s.publishBtnText}>Publish Offering</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Meeting Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={s.overlay}>
          <View style={s.modal}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{editIndex !== null ? "Edit Meeting" : "Add Meeting"}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Field label="Day">
              <View style={s.pickerBox}>
                <Picker selectedValue={curMeeting.day} onValueChange={v => setCurMeeting({...curMeeting, day: v})} style={s.picker}>
                  {DAYS_OF_WEEK.map(d => <Picker.Item key={d} label={d} value={d} />)}
                </Picker>
              </View>
            </Field>

            <Field label="Slot">
              <View style={s.pickerBox}>
                <Picker selectedValue={curMeeting.slot} onValueChange={(v: number) => {
                  const slot = Number(v);
                  const t = calcTime(slot, 1);
                  setCurMeeting({...curMeeting, slot, timeStart: t.timeStart, timeEnd: t.timeEnd});
                }} style={s.picker}>
                  {TIME_SLOTS.map(sl => <Picker.Item key={sl} label={`Slot ${sl}`} value={sl} />)}
                </Picker>
              </View>
            </Field>

            <Field label="Time">
              <View style={s.pickerBox}>
                <Picker
                  selectedValue={`${curMeeting.timeStart}-${curMeeting.timeEnd}`}
                  onValueChange={val => {
                    const [ts, te] = val.split("-");
                    setCurMeeting({...curMeeting, timeStart: ts, timeEnd: te});
                  }}
                  style={s.picker}
                >
                  {(() => {
                    const one = calcTime(curMeeting.slot, 1);
                    const three = calcTime(curMeeting.slot, 3);
                    return [
                      <Picker.Item key="1" label={`${one.timeStart} - ${one.timeEnd} (1 slot)`} value={`${one.timeStart}-${one.timeEnd}`} />,
                      <Picker.Item key="3" label={`${three.timeStart} - ${three.timeEnd} (3 slots)`} value={`${three.timeStart}-${three.timeEnd}`} />,
                    ];
                  })()}
                </Picker>
              </View>
            </Field>

            <Field label="Room Number">
              <TextInput
                style={s.input}
                placeholder="e.g. 301, Lab-A"
                placeholderTextColor={Colors.textSecondary}
                value={curMeeting.roomNo}
                onChangeText={v => setCurMeeting({...curMeeting, roomNo: v.toUpperCase()})}
                autoCapitalize="characters"
              />
            </Field>

            <TouchableOpacity style={s.saveBtn} onPress={saveMeeting}>
              <Text style={s.saveBtnText}>Save Meeting</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: "row", alignItems: "center", padding: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: Spacing.md },
  backBtn: { padding: 4 },
  headerTitle: { ...Typography.h2, color: Colors.textPrimary, flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: 40 },
  card: { backgroundColor: Colors.surface, borderRadius: 12, padding: Spacing.lg, marginBottom: Spacing.md, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.md },
  sectionTitle: { ...Typography.h3, color: Colors.textPrimary, fontWeight: "600", marginBottom: Spacing.md },
  field: { marginBottom: Spacing.md },
  label: { ...Typography.body, color: Colors.textPrimary, fontWeight: "600", marginBottom: 6 },
  input: { backgroundColor: Colors.background, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, paddingVertical: 10, ...Typography.body, color: Colors.textPrimary },
  pickerBox: { backgroundColor: Colors.background, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, overflow: "hidden" },
  picker: { height: 48, color: Colors.textPrimary },
  hint: { ...Typography.small, color: Colors.textSecondary, marginTop: 4 },
  count: { ...Typography.body, color: Colors.primary, fontWeight: "600" },
  meetingRow: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.background, borderRadius: 8, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm },
  meetingDay: { ...Typography.body, color: Colors.textPrimary, fontWeight: "600" },
  meetingMeta: { ...Typography.small, color: Colors.textSecondary, marginTop: 2 },
  addBtn: { flexDirection: "row", backgroundColor: Colors.secondary, borderRadius: 8, padding: 12, alignItems: "center", justifyContent: "center", gap: Spacing.sm, marginTop: Spacing.sm },
  addBtnDisabled: { backgroundColor: Colors.border },
  addBtnText: { color: "#fff", fontWeight: "600" },
  publishBtn: { flexDirection: "row", backgroundColor: Colors.primary, borderRadius: 8, padding: 14, alignItems: "center", justifyContent: "center", gap: Spacing.sm, marginBottom: 40 },
  publishBtnDisabled: { backgroundColor: Colors.border },
  publishBtnText: { color: "#fff", fontWeight: "600" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modal: { backgroundColor: Colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: Spacing.lg, maxHeight: "80%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.lg },
  modalTitle: { ...Typography.h2, color: Colors.textPrimary },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: 8, padding: 14, alignItems: "center", marginTop: Spacing.md },
  saveBtnText: { color: "#fff", fontWeight: "600" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: Spacing.xl, gap: Spacing.md },
  successTitle: { ...Typography.h1, color: Colors.success },
  successMsg: { ...Typography.body, color: Colors.textSecondary, textAlign: "center" },
  primaryBtn: { backgroundColor: Colors.primary, borderRadius: 8, padding: 14, paddingHorizontal: 32, marginTop: Spacing.md },
  primaryBtnText: { color: "#fff", fontWeight: "600" },
});
