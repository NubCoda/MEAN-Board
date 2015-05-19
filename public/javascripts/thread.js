var threadModule = angular.module('thread', ['board', 'post']);

threadModule.config(['$stateProvider', function($stateProvider){
	$stateProvider
		.state('createThread', {
			url: '/create-thread?categoryId',
			views: {
				'navbar': {
						templateUrl: './partials/navbar.html'
					},
				'body': {
					templateUrl: './partials/thread.html',
					controller: 'createThreadCtrl',
				},
				'create-thread@createThread': {
					templateUrl: './partials/thread.create.html',
				},
				'modal': {
					templateUrl: './partials/user.register.html'
				}
			},
			resolve: {
				category: ['$stateParams', 'categoryFactory', function($stateParams, categoryFactory){
					return categoryFactory.getSingleCategory($stateParams.categoryId)
				}]
			}
		})
		.state('threadById', {
			url: '/view-thread?categoryId&threadId',
			views: {
				'navbar': {
						templateUrl: './partials/navbar.html'
					},
				'body': {
					templateUrl: './partials/thread.html',
					controller: 'basicThreadCtrl',
				},
				'view-thread@threadById': {
					templateUrl: './partials/thread.view.html',
				},
				'modal': {
					templateUrl: './partials/user.register.html'
				}
			},
			resolve: {
				category: ['$stateParams', 'categoryFactory', function($stateParams, categoryFactory){
					return categoryFactory.getSingleCategory($stateParams.categoryId);
				}],
				thread: ['$stateParams', 'threadFactory', function($stateParams, threadFactory){
					return threadFactory.getThread($stateParams.threadId);
				}]
			}
		});
}]);

threadModule.factory('threadFactory', ['$http', function($http){
	var threadObject = {
		threadJSON : []
	}

	threadObject.createThread = function(thread, callback){
		return $http.post('/api/thread', thread).success(function(data){
			callback(data);
		})
		.error(function(error){
			console.log(error);
		});
	}

	threadObject.getThread = function(threadId){
		return $http.get('/api/thread/' + threadId).success(function(data){
			return data;
		});
	}

	return threadObject;
}]);

threadModule.controller('createThreadCtrl', ['$scope', '$location', 'threadFactory', 'postFactory', 'category', function($scope, $location, threadFactory, postFactory, category){
	$scope.category = category.data;
	$scope.newThread = {};
	$scope.newPost = {};
	$scope.createThread = function(){
		$scope.newThread.parent = $scope.category;
		threadFactory.createThread($scope.newThread, function(thread){
			$scope.newPost.parent = thread;
			postFactory.createPost($scope.newPost, function(){
				$location.path('/view-thread').search('threadId', thread._id);
			});
		});
	}
}]);

threadModule.controller('basicThreadCtrl', ['$scope', 'threadFactory', 'postFactory', 'category', 'thread', function($scope, threadFactory, postFactory, category, thread){
	// TODO: update post(s), delete  post(s) and move post(s)
	$scope.thread = thread.data;
	$scope.category = category.data;
	$scope.newPost = {};
	$scope.editPost = {};
	$scope.isEditationEnabled = false;
	$scope.editItemId = null;

	console.log($scope.thread);

	$scope.$watch('editPost', function(newValue, oldValue){

	});

	$scope.createPost = function(){
		$scope.newPost.parent = $scope.thread;
		postFactory.createPost($scope.newPost, function(data){
			$scope.getPost(data._id);
			//$scope.thread.posts.push($scope.getPost(data._id));
			$scope.newPost = {};
		});
	}

	$scope.getPost = function(postId){
		var promise = postFactory.getPost(postId);
		promise.then(function(result){
			return result.data;
		});
	}

	$scope.updatePost = function(post){
		postFactory.updatePost(post, function(){
			$scope.enableEditation(false, null);
		});
	}

	$scope.deletePost = function(post){
		postFactory.deletePost(post._id, function(){
			//console.log($scope.thread.posts[$scope.thread.posts.indexOf(post)]);
			$scope.thread.posts[$scope.thread.posts.indexOf(post)].deletedAt = Date.Now;
			// splice(position, numberOfItemsToRemove, item)
			$scope.thread.posts.splice($scope.thread.posts[$scope.thread.posts.indexOf(post)], 1, post);
			//console.log($scope.thread.posts[$scope.thread.posts.indexOf(post)]);
		});
	}

	$scope.enableEditation = function(boolEnable, itemId){
		$scope.isEditationEnabled = boolEnable;
		$scope.editItemId = itemId;
	}
}]);
