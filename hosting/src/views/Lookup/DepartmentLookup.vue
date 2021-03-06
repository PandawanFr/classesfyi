<template>
  <div
    v-if="
      campusId !== null &&
      departmentId !== null &&
      courses !== null &&
      error === null
    "
  >
    <h2>
      <BackButton />
      <span>{{ campusId.toUpperCase() }} {{ departmentName }} Courses</span>
    </h2>
    <SearchableList
      placeholder="Search for a course..."
      :items="courses"
      :filter="searchFilter"
      v-slot="{ item: course }"
    >
      <router-link :to="`/lookup/${campusId}/${departmentId}/${course.course}`">
        <div class="course">
          <span class="id">{{ departmentId }} {{ course.course }}</span>
          -
          <span class="name">{{ course.title }}</span>
        </div>
      </router-link>
    </SearchableList>
  </div>
  <div v-else>
    <p>{{ error ?? "Something went wrong, please try again." }}</p>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, Ref, ref, watch } from "vue";
import { useRoute } from "vue-router";
import SearchableList from "/@/components/SearchableList.vue";
import {
  getCampusDepartments,
  getDepartmentCourses,
  getDepartmentInfo,
} from "/@/utilities/openCourseApi";
import { APIError } from "/@/utilities/APIError";
import {
  availableCampuses,
  CampusId,
  isAvailableCampus,
} from "/@/utilities/campus";
import BackButton from "/@/components/BackButton.vue";
import { getOrFetchTerm } from "/@/stores/term";

// TODO: Fuzzy search
const searchFilter = (item, query) => {
  // Compute a queryString with possible combinations/ways for people to search to match as many as possible
  return (
    `${item.dept} ${item.course} ${item.dept}${item.course} ${item.title}`
      .toLowerCase()
      .indexOf(query.toLowerCase()) !== -1
  );
};

export default defineComponent({
  name: "Lookup",
  components: {
    SearchableList,
    BackButton,
  },
  setup(props) {
    const route = useRoute();
    const campusId = computed(() => route.params.campusId as CampusId);
    const campusName = computed<string>(
      () => availableCampuses[campusId.value]
    );
    const departmentId = computed(() => route.params.departmentId as string);

    let error = ref<APIError | null>(null);

    let departmentName = ref<string | null>(null);

    const getDepartment = async () => {
      if (isAvailableCampus(campusId.value)) {
        const { year, term } = await getOrFetchTerm(campusId.value);
        const [err, dept] = await getDepartmentInfo(
          campusId.value,
          departmentId.value,
          year,
          term
        );

        if (err === null) {
          departmentName.value = dept.name;
          error.value = null;
        } else {
          error.value = err;
          departmentName.value = null;
        }
      } else {
        error.value = new APIError(404, "No campus found with given id");
        departmentName.value = null;
      }
    };

    let courses = ref<any[] | null>(null);

    const getCourses = async () => {
      if (isAvailableCampus(campusId.value)) {
        const [err, crs] = await getDepartmentCourses(
          campusId.value,
          departmentId.value
        );

        if (err === null) courses.value = crs;
        else error.value = err;
      } else {
        error.value = new APIError(404, "No campus found with given id");
      }
    };

    onMounted(getDepartment);
    onMounted(getCourses);

    return {
      campusId,
      campusName,
      departmentId,
      departmentName,
      courses,
      error,
      searchFilter,
    };
  },
});
</script>

<style scoped>
.course {
  margin: 0 0.5em;
  padding: 0.25em 0;
  font-size: 1.15em;
}
</style>