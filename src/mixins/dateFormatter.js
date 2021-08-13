import moment from "moment";

export default {
    methods: {
        getFormattedDate(date,format) {
            return moment(date).format(format)
        },
    }
}