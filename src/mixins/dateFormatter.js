import moment from "moment";

export default {
    methods: {
        getFormattedDate(date,format) {
            if (date === null || date === undefined || date === '') return ''
            return moment(date).format(format)
        },
    }
}