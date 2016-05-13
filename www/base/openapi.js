define(['zepto'], function($) {
    var ip = "http://114.251.242.54/EBTCAB";
    var OpenAPI = {
        "isLocal": false,
        "dataType": "JSON",
        "pageSize": 10,
        "access_token": ip + "/action/openapi/token",
        "clear_notice": ip + "/action/openapi/clear_notice",

        //用户登录
        "login": ip + "/rest/user/login.json",
        
        //用户详细信息
        "userDetailInfo": ip + "/rest/user/get_userdetail.json",

        //课程列表查询
        "courseListInfo": ip + "/rest/lesson/query_lessons.json",
        
        //课程明细查询
        "courseDetailInfo": ip + "/rest/lesson/query_lesson_detail.json",

        //查询分组
        "queryGroup": ip + "/rest/group/query_group.json",

        //已完成课程查询
        "completeCourseList": ip + "/rest/score/query_finished_lessons.json",
        //增加批次
        "newBatch": ip + "/rest/group/new_batch.json",
        //增加批次
        
        
        "updateBatch": ip + "/rest/group/update_batch.json",
        //增加分组
        "newGroup": ip + "/rest/group/new_group.json",
        //增加分组人员
        "newStudent": ip + "/rest/group/new_student.json",
        //删除分组
        "removeGroup": ip + "/rest/group/remove_group.json",
        //删除学生
        "removeStudent": ip + "/rest/group/remove_student.json",
        //修改学生
        "change": ip + "/rest/group/update_student.json",
        //修改分组
        "updateGroup": ip + "/rest/group/update_group.json",
        //查询已指导完成课程
        "queryFinishedLessons": ip + "/rest/score/query_finished_lessons.json",

        //20160308查询已指导完成课程批次
        "queryFinishedLessonsBatch": ip + "/rest/score/query_finished_lessons_batch.json",
        //20160308查询已指导完成课程批次明细
        "queryFinishedBatchScore": ip + "/rest/score/query_finished_batch_score.json",
        //评分信息上传
        "scoreUpload": ip + "/rest/score/score_upload.json",
        
        //评分详细信息查询
        "queryLessonScore": ip + "/rest/score/query_lesson_score.json",
        
        //能力分析查询
        "getUserAbility": ip + "/rest/tool/get_user_ability.json",
        // 评分报告查询
        "query_report": ip + "/rest/score/query_report.json",
        
        //课程反馈
        "newFeedback": ip + "/rest/feedback/new_feedback.json",
        
        //反馈信息查询
        "queryFeedbacks": ip + "/rest/feedback/query_feedbacks.json",
        //验证学员是否存在
        "exists": ip + "/rest/user/exists.json",
        
        //考试计划列表查询
        "plans": ip + "/rest/plan/plans.json",
        //考试计划详情查询
        "query_plan": ip + "/rest/plan/query_plan.json",
        //基础计划信息查询
        "query_user_info": ip + "/rest/plan/query_user_info.json",
        //考试计划填写
        "upload_plan": ip + "/rest/plan/upload_plan.json",
        //考试计划修改
        "update_plan": ip + "/rest/plan/update_plan.json",
        //考试计划删除
        "delete_plan": ip + "/rest/plan/delete_plan.json",
        //考试计划开始执行
        "start": ip + "/rest/plan/start.json",
        //回退考试计划
        "rollback": ip + "/rest/plan/rollback.json",
        //模糊查询用户姓名
        "query_users": ip + "/rest/user/query_users.json",
        //学员问卷查询
        "query_survey": ip + "/rest/surveys/get_user_survey.json",
        //问卷明细查询
        "survey_detail": ip +"/rest/surveys/get_survey_detail.json",
        //问卷上传
        "upload_survey": ip +"/rest/surveys/upload_user_survey.json"

    };

    var OpenAPI_local = {
        "dataType": "JSON",
        "pageSize": 10,
        "login": "../template/login_temp.js",
        "allCourse": "../template/allCourse_temp.js",
        "guidedCourse_template": "../template/guidedCourse_data.json",
        "coursePage_template": '../template/coursePage_temp.js',
        "ResultsUpload_template": "../template/ResultsUpload_temp.js",
        "completeCourse_template": "../template/completeCourse_data.json",
        "trainResult": "../template/trainResult_temp.js",
        "courseDetailInfo": "../template/courseDetailInfo.json",
        "participationQuery_template": "../template/participationQuery_data.json",
        "guidedResultPage_template": "../template/guidedResultPage_data.json",
        "completeResultPage_template": "../template/completeResultPage_data.json",
        "courseListInfo": "../template/courseListInfo.json",
        "complaintView_template": "../template/complaintView_data.json",
        "completeCourseFeedback_template": "../template/completeCourseFeedback_data.json",
        "userDetailInfo": "../template/userDetailInfo.json",
        "resultPage": "../template/courseScore.json",
        "sqhom_test_courseDetailInfo":"../template/sqhom_test_courseDetailInfo.json",
        "scoreUpload": "../template/score_upload.js",
        "getUserAbility":"../template/trainResultView_data.json",
        "queryFinishedLessons": ip + "/rest/score/query_finished_lessons.json"
    };


    //return OpenAPI;
    if (!OpenAPI.isLocal) {
        return OpenAPI;
    } else {
        return OpenAPI_local;
    }
});