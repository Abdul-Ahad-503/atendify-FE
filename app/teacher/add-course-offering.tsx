import { Colors, Spacing, Typography } from "@/constants/theme";
import {
  AddMeetingRequest,
  authApi,
  CourseTemplate,
  offeringApi,
  Program,
  Term,
  User,
} from "@/utils/api";
import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const TIME_SLOTS = Array.from({ length: 10 }, (_, i) => i + 1);
const SECTION_OPTIONS = ["A", "B", "Evening"];

// Slot time mappings based on university schedule
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

export default function AddCourseOfferingScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [terms, setTerms] = useState<Term[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [courses, setCourses] = useState<CourseTemplate[]>([]); // For lookup

  // Form state
  const [selectedTermId, setSelectedTermId] = useState("");
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [section, setSection] = useState("");
  const [courseName, setCourseName] = useState("");
  const [creditHours, setCreditHours] = useState<number | null>(null);

  // Meetings
  const [meetings, setMeetings] = useState<AddMeetingRequest[]>([]);
  const [meetingModalVisible, setMeetingModalVisible] = useState(false);
  const [editingMeetingIndex, setEditingMeetingIndex] = useState<number | null>(
    null,
  );
  const [currentMeeting, setCurrentMeeting] = useState<AddMeetingRequest>({
    day: "Monday",
    slot: 1,
    roomNo: "",
    timeStart: "08:30",
    timeEnd: "09:20",
  });
  const [meetingDuration, setMeetingDuration] = useState<1 | 3>(1); // 1 slot or 3 slots

  // Success state
  const [showSuccessOptions, setShowSuccessOptions] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [userData, termsData, programsData, coursesData] =
        await Promise.all([
          authApi.getMe(),
          offeringApi.getTerms(),
          offeringApi.getPrograms(),
          offeringApi.getCourses(),
        ]);
      setUser(userData);
      setTerms(termsData);
      setPrograms(programsData);
      setCourses(coursesData);
      const activeTerm = termsData.find((t) => t.isActive);
      if (activeTerm) {
        setSelectedTermId(activeTerm.id);
        // Set default semester based on term type
        const termName = activeTerm.name.toLowerCase();
        if (termName.includes("spring")) {
          setSelectedSemester(2); // Spring = even, default to 2
        } else if (termName.includes("fall")) {
          setSelectedSemester(1); // Fall = odd, default to 1
        }
      }
    } catch (error: any) {
      // Try to at least get user data
      try {
        const userData = await authApi.getMe();
        setUser(userData);
      } catch (userError) {
        console.error("Failed to load user data:", userError);
      }

      // Fallback data when API fails
      const fallbackTerms: Term[] = [
        {
          id: "spring-2026",
          name: "Spring 2026",
          startDate: "2026-01-01",
          endDate: "2026-05-31",
          isActive: true,
        },
        {
          id: "fall-2025",
          name: "Fall 2025",
          startDate: "2025-08-01",
          endDate: "2025-12-31",
          isActive: false,
        },
      ];

      const fallbackPrograms: Program[] = [
        {
          id: "BSCS",
          name: "Computer Science",
          code: "BSCS",
          department: "Computer Science",
        },
        {
          id: "bs-ai",
          name: "Artificial Intelligence",
          code: "BS-AI",
          department: "Computer Science",
        },
        {
          id: "bs-se",
          name: "Software Engineering",
          code: "BS-SE",
          department: "Computer Science",
        },
        {
          id: "bs-cet",
          name: "Computer Engineering Technology",
          code: "BS-CET",
          department: "Engineering",
        },
      ];

      setTerms(fallbackTerms);
      setPrograms(fallbackPrograms);
      setCourses([]);
      setSelectedTermId("spring-2026"); // Auto-select active term
      setSelectedSemester(2); // Spring = even semester, default to 2
      Alert.alert("Using Sample Data", "Could not load from server.");
    } finally {
      setLoading(false);
    }
  };

  const getRequiredMeetings = (): number => creditHours || 0;
  const hasAllMeetings = (): boolean =>
    meetings.length === getRequiredMeetings() && meetings.length > 0;

  // Get available semesters based on selected term (Spring=even, Fall=odd)
  const getAvailableSemesters = (): number[] => {
    const selectedTerm = terms.find((t) => t.id === selectedTermId);
    if (!selectedTerm) return [1, 2, 3, 4, 5, 6, 7, 8];

    const termName = selectedTerm.name.toLowerCase();
    if (termName.includes("spring")) {
      return [2, 4, 6, 8]; // Spring = even semesters
    } else if (termName.includes("fall")) {
      return [1, 3, 5, 7]; // Fall = odd semesters
    }
    return [1, 2, 3, 4, 5, 6, 7, 8]; // Default to all
  };

  // Calculate time range based on slot and duration (1 or 3 slots)
  const calculateTimeRange = (slot: number, duration: 1 | 3) => {
    const startSlot = SLOT_TIMES[slot];
    if (!startSlot) return { timeStart: "08:30", timeEnd: "09:20" };

    if (duration === 1) {
      return { timeStart: startSlot.start, timeEnd: startSlot.end };
    } else {
      // For 3 slots (lab), end time is from slot + 2
      const endSlot = SLOT_TIMES[slot + 2];
      return {
        timeStart: startSlot.start,
        timeEnd: endSlot ? endSlot.end : startSlot.end,
      };
    }
  };

  const validateForm = (): string | null => {
    if (!user?.department) return "Unable to get your department information";
    if (!selectedTermId) return "Please select a term";
    if (!selectedProgramId) return "Please select a program";
    if (!selectedSemester) return "Please select a semester";
    if (!section) return "Please select a section";
    if (!courseName.trim()) return "Please enter course name";
    if (!creditHours || creditHours < 1)
      return "Please enter valid credit hours";
    if (meetings.length < getRequiredMeetings())
      return `You need to add ${getRequiredMeetings()} meetings for this ${getRequiredMeetings()}-credit course`;
    return null;
  };

  const handleAddMeeting = () => {
    const requiredMeetings = getRequiredMeetings();
    if (!courseName.trim() || !creditHours || creditHours < 1) {
      Alert.alert("Error", "Enter course name and credit hours first");
      return;
    }
    if (meetings.length >= requiredMeetings) {
      Alert.alert(
        "Maximum Meetings Reached",
        `This ${requiredMeetings}-credit course requires exactly ${requiredMeetings} meetings.`,
      );
      return;
    }
    const initialTime = calculateTimeRange(1, 1);
    setCurrentMeeting({
      day: "Monday",
      slot: 1,
      roomNo: "",
      timeStart: initialTime.timeStart,
      timeEnd: initialTime.timeEnd,
    });
    setMeetingDuration(1);
    setEditingMeetingIndex(null);
    setMeetingModalVisible(true);
  };

  const handleEditMeeting = (index: number) => {
    const meeting = meetings[index];
    setCurrentMeeting(meeting);

    // Determine duration based on time difference
    // Check if this is a 3-slot meeting by comparing with slot times
    const slot = meeting.slot;
    const threeSlotTime = calculateTimeRange(slot, 3);
    const isDuration3 = meeting.timeEnd === threeSlotTime.timeEnd;

    setMeetingDuration(isDuration3 ? 3 : 1);
    setEditingMeetingIndex(index);
    setMeetingModalVisible(true);
  };

  const handleSaveMeeting = () => {
    if (!currentMeeting.roomNo.trim()) {
      Alert.alert("Validation Error", "Please enter a room number");
      return;
    }
    if (editingMeetingIndex !== null) {
      const updatedMeetings = [...meetings];
      updatedMeetings[editingMeetingIndex] = currentMeeting;
      setMeetings(updatedMeetings);
    } else {
      setMeetings([...meetings, currentMeeting]);
    }
    setMeetingModalVisible(false);
  };

  const handleDeleteMeeting = (index: number) => {
    Alert.alert(
      "Delete Meeting",
      "Are you sure you want to delete this meeting?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => setMeetings(meetings.filter((_, i) => i !== index)),
        },
      ],
    );
  };

  // Create offering, add meetings, publish if flag
  const submitOfferingFlow = async (publish = false) => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert("Validation Error", validationError);
      return;
    }
    setSubmitting(true);
    try {
      // 1. Create Offering
      console.log("Creating offering with data:", {
        termId: selectedTermId,
        programId: selectedProgramId,
        semester: selectedSemester,
        section,
        courseName: courseName.trim(),
        creditHours: creditHours!,
        departmentId: user?.department || "",
      });

      const offering = await offeringApi.createOffering({
        termId: selectedTermId,
        programId: selectedProgramId,
        semester: selectedSemester,
        section,
        courseName: courseName.trim(),
        creditHours: creditHours!,
        departmentId: user?.department || "",
      });

      console.log("Offering created:", offering);

      // 2. Add Meetings
      for (let i = 0; i < meetings.length; i++) {
        const meeting = meetings[i];
        console.log(`Adding meeting ${i + 1}/${meetings.length}:`, meeting);
        try {
          await offeringApi.addMeeting(offering.id, meeting);
        } catch (meetingError: any) {
          throw new Error(
            `Failed to add meeting ${i + 1}: ${meetingError.message}`,
          );
        }
      }

      console.log("All meetings added successfully");

      // 3. Publish if needed
      if (publish) {
        console.log("Publishing offering:", offering.id);
        await offeringApi.publishOffering(offering.id);
        Alert.alert("Success", "Course offering published successfully!");
      } else {
        Alert.alert("Success", "Course offering saved as draft successfully!");
      }
      setShowSuccessOptions(true);
    } catch (error: any) {
      console.error("Submit offering error:", error);
      const errorMessage = error.message || "Failed to save offering";
      Alert.alert("Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    await submitOfferingFlow(false);
  };

  const handlePublish = async () => {
    await submitOfferingFlow(true);
  };

  const handleAddAnother = () => {
    setSelectedProgramId("");
    setSelectedSemester(1);
    setSection("");
    setCourseName("");
    setCreditHours(null);
    setMeetings([]);
    setShowSuccessOptions(false);
  };

  const handleReturnToDashboard = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Course Offering</Text>
      </View>
      {/* Success Options */}
      {showSuccessOptions ? (
        <View style={styles.successContainer}>
          <MaterialIcons name="check-circle" size={80} color={Colors.success} />
          <Text style={styles.successTitle}>Offering Created!</Text>
          <Text style={styles.successMessage}>
            Your course offering has been saved successfully.
          </Text>
          <View style={styles.successActions}>
            <TouchableOpacity
              style={styles.addAnotherButton}
              onPress={handleAddAnother}
            >
              <MaterialIcons name="add" size={20} color={Colors.surface} />
              <Text style={styles.addAnotherButtonText}>
                Add Another Course
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.returnButton}
              onPress={handleReturnToDashboard}
            >
              <Text style={styles.returnButtonText}>Return to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {/* Instructions Card */}
          <View style={styles.instructionsCard}>
            <MaterialIcons
              name="info-outline"
              size={24}
              color={Colors.primary}
            />
            <View style={styles.instructionsContent}>
              <Text style={styles.instructionsTitle}>Instructions</Text>
              <Text style={styles.instructionsText}>
                Enter the course name and credit hours to add a new course, then
                fill in details and meetings.
              </Text>
              <Text style={styles.instructionsText}>
                The number of meetings must match the course credit hours.
              </Text>
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Offering Details</Text>
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Term <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedTermId}
                  onValueChange={(value: string) => {
                    setSelectedTermId(value);
                    // Auto-adjust semester if current selection is not valid for new term
                    const newTerm = terms.find((t) => t.id === value);
                    if (newTerm) {
                      const termName = newTerm.name.toLowerCase();
                      const availableSemesters = termName.includes("spring")
                        ? [2, 4, 6, 8]
                        : termName.includes("fall")
                          ? [1, 3, 5, 7]
                          : [1, 2, 3, 4, 5, 6, 7, 8];

                      if (!availableSemesters.includes(selectedSemester)) {
                        setSelectedSemester(availableSemesters[0]);
                      }
                    }
                  }}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Term" value="" />
                  {terms.map((term) => (
                    <Picker.Item
                      key={term.id}
                      label={`${term.name} ${term.isActive ? "(Active)" : ""}`}
                      value={term.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Program <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedProgramId}
                  onValueChange={setSelectedProgramId}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Program" value="" />
                  {programs.map((program) => (
                    <Picker.Item
                      key={program.id}
                      label={`${program.name} (${program.code})`}
                      value={program.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Semester <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedSemester}
                  onValueChange={(value: number) =>
                    setSelectedSemester(Number(value))
                  }
                  style={styles.picker}
                >
                  {getAvailableSemesters().map((sem) => (
                    <Picker.Item
                      key={sem}
                      label={`Semester ${sem}`}
                      value={sem}
                    />
                  ))}
                </Picker>
              </View>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Section <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={section}
                  onValueChange={setSection}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Section" value="" />
                  {SECTION_OPTIONS.map((sec) => (
                    <Picker.Item key={sec} label={sec} value={sec} />
                  ))}
                </Picker>
              </View>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Course Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Physics for Computing"
                value={courseName}
                onChangeText={setCourseName}
                autoCapitalize="words"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Credit Hours <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 3"
                value={creditHours !== null ? String(creditHours) : ""}
                onChangeText={(value) => {
                  const num = Number(value);
                  setCreditHours(isNaN(num) ? null : num);
                }}
                keyboardType="numeric"
                maxLength={1}
              />
            </View>
            {creditHours !== null && (
              <Text style={styles.helpText}>
                {"You must add " + creditHours + " meeting(s)."}
              </Text>
            )}
          </View>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Meetings</Text>
              {creditHours !== null && (
                <Text style={styles.meetingCount}>
                  {meetings.length} / {getRequiredMeetings()} added
                </Text>
              )}
            </View>
            {creditHours !== null && (
              <Text style={styles.helpText}>
                {hasAllMeetings()
                  ? "✓ All required meetings added"
                  : `Add ${getRequiredMeetings() - meetings.length} more meeting(s)`}
              </Text>
            )}
            {meetings.map((meeting, index) => (
              <View key={index} style={styles.meetingCard}>
                <View style={styles.meetingInfo}>
                  <Text style={styles.meetingDay}>{meeting.day}</Text>
                  <Text style={styles.meetingDetails}>
                    Slot {meeting.slot} • Room {meeting.roomNo}
                  </Text>
                  <Text style={styles.meetingTime}>
                    {meeting.timeStart} - {meeting.timeEnd}
                  </Text>
                </View>
                <View style={styles.meetingActions}>
                  <TouchableOpacity
                    onPress={() => handleEditMeeting(index)}
                    style={styles.iconButton}
                  >
                    <MaterialIcons
                      name="edit"
                      size={20}
                      color={Colors.primary}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteMeeting(index)}
                    style={styles.iconButton}
                  >
                    <MaterialIcons
                      name="delete"
                      size={20}
                      color={Colors.error}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <TouchableOpacity
              style={[
                styles.addMeetingButton,
                (creditHours === null ||
                  meetings.length >= getRequiredMeetings()) &&
                  styles.addMeetingButtonDisabled,
              ]}
              onPress={handleAddMeeting}
              disabled={
                creditHours === null || meetings.length >= getRequiredMeetings()
              }
            >
              <MaterialIcons name="add" size={20} color={Colors.surface} />
              <Text style={styles.addMeetingButtonText}>Add Meeting</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.draftButton, submitting && styles.buttonDisabled]}
              onPress={handleSaveDraft}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={Colors.surface} />
              ) : (
                <>
                  <MaterialIcons name="save" size={20} color={Colors.surface} />
                  <Text style={styles.draftButtonText}>Save Draft</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.publishButton,
                (submitting || !hasAllMeetings()) && styles.buttonDisabled,
              ]}
              onPress={handlePublish}
              disabled={submitting || !hasAllMeetings()}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={Colors.surface} />
              ) : (
                <>
                  <MaterialIcons
                    name="publish"
                    size={20}
                    color={Colors.surface}
                  />
                  <Text style={styles.publishButtonText}>Publish Offering</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
      {/* Meeting Modal */}
      <Modal
        visible={meetingModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMeetingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingMeetingIndex !== null ? "Edit Meeting" : "Add Meeting"}
              </Text>
              <TouchableOpacity onPress={() => setMeetingModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={Colors.icon} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Day</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={currentMeeting.day}
                    onValueChange={(value: string) =>
                      setCurrentMeeting({ ...currentMeeting, day: value })
                    }
                    style={styles.picker}
                  >
                    {DAYS_OF_WEEK.map((day) => (
                      <Picker.Item key={day} label={day} value={day} />
                    ))}
                  </Picker>
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Slot</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={currentMeeting.slot}
                    onValueChange={(value: number) => {
                      const slot = Number(value);
                      // Default to 1 slot time when changing slots
                      const timeRange = calculateTimeRange(slot, 1);
                      setCurrentMeeting({
                        ...currentMeeting,
                        slot,
                        timeStart: timeRange.timeStart,
                        timeEnd: timeRange.timeEnd,
                      });
                      setMeetingDuration(1);
                    }}
                    style={styles.picker}
                  >
                    {TIME_SLOTS.map((slot) => (
                      <Picker.Item
                        key={slot}
                        label={`Slot ${slot}`}
                        value={slot}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Time</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={`${currentMeeting.timeStart}-${currentMeeting.timeEnd}`}
                    onValueChange={(value: string) => {
                      const [timeStart, timeEnd] = value.split("-");
                      setCurrentMeeting({
                        ...currentMeeting,
                        timeStart,
                        timeEnd,
                      });
                      // Update duration based on selection
                      const oneSlot = calculateTimeRange(
                        currentMeeting.slot,
                        1,
                      );
                      if (
                        timeStart === oneSlot.timeStart &&
                        timeEnd === oneSlot.timeEnd
                      ) {
                        setMeetingDuration(1);
                      } else {
                        setMeetingDuration(3);
                      }
                    }}
                    style={styles.picker}
                  >
                    {(() => {
                      const oneSlot = calculateTimeRange(
                        currentMeeting.slot,
                        1,
                      );
                      const threeSlots = calculateTimeRange(
                        currentMeeting.slot,
                        3,
                      );
                      return [
                        <Picker.Item
                          key="1-slot"
                          label={`${oneSlot.timeStart} - ${oneSlot.timeEnd}`}
                          value={`${oneSlot.timeStart}-${oneSlot.timeEnd}`}
                        />,
                        <Picker.Item
                          key="3-slots"
                          label={`${threeSlots.timeStart} - ${threeSlots.timeEnd}`}
                          value={`${threeSlots.timeStart}-${threeSlots.timeEnd}`}
                        />,
                      ];
                    })()}
                  </Picker>
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Room Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 301, Lab-A"
                  value={currentMeeting.roomNo}
                  onChangeText={(value) =>
                    setCurrentMeeting({ ...currentMeeting, roomNo: value })
                  }
                  autoCapitalize="characters"
                />
              </View>
            </ScrollView>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleSaveMeeting}
            >
              <Text style={styles.modalSaveButtonText}>Save Meeting</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ... [styles unchanged, use your original styles for layout/colors]

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.md,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  instructionsCard: {
    flexDirection: "row",
    backgroundColor: Colors.primary + "10",
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  instructionsContent: {
    flex: 1,
  },
  instructionsTitle: {
    ...Typography.h3,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  instructionsText: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  meetingCount: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: "600",
  },
  formGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  required: {
    color: Colors.error,
  },
  pickerContainer: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  picker: {
    height: 50,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  helpText: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  meetingCard: {
    flexDirection: "row",
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  meetingInfo: {
    flex: 1,
  },
  meetingDay: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  meetingDetails: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  meetingTime: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  meetingActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  iconButton: {
    padding: Spacing.xs,
  },
  addMeetingButton: {
    flexDirection: "row",
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    padding: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  addMeetingButtonDisabled: {
    backgroundColor: Colors.border,
  },
  addMeetingButtonText: {
    ...Typography.body,
    color: Colors.surface,
    fontWeight: "600",
  },
  actionsContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  draftButton: {
    flexDirection: "row",
    backgroundColor: Colors.textSecondary,
    borderRadius: 8,
    padding: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  draftButtonText: {
    ...Typography.body,
    color: Colors.surface,
    fontWeight: "600",
  },
  publishButton: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  publishButtonText: {
    ...Typography.body,
    color: Colors.surface,
    fontWeight: "600",
  },
  buttonDisabled: {
    backgroundColor: Colors.border,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.lg,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  modalSaveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: Spacing.lg,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  modalSaveButtonText: {
    ...Typography.body,
    color: Colors.surface,
    fontWeight: "600",
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  successTitle: {
    ...Typography.h1,
    color: Colors.success,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  successMessage: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  successActions: {
    width: "100%",
    gap: Spacing.md,
  },
  addAnotherButton: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  addAnotherButtonText: {
    ...Typography.body,
    color: Colors.surface,
    fontWeight: "600",
  },
  returnButton: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    alignItems: "center",
  },
  returnButtonText: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
});
