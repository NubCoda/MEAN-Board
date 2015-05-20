var threadModule = angular.module('thread', ['category', 'post']);

threadModule.config(['$stateProvider', function($stateProvider){
	$stateProvider
		.state('create-thread', {
			url: '/board/category/create-thread?categoryId',
			views: {
				'navbar': {
						templateUrl: './partials/navbar.html'
					},
				'body': {
					templateUrl: './partials/thread.html',
					controller: 'createThreadCtrl',
				},
				'thread-create-view@create-thread': {
					templateUrl: './partials/thread.create.html',
				},
				'modal': {
					templateUrl: './partials/user.register.html'
				}
			},
			resolve: {
				category: ['$stateParams', 'categoryFactory', function($stateParams, categoryFactory){
					return categoryFactory.getSingleCategory($stateParams.categoryId);
				}]
			}
		})
		.state('view-thread', {
			url: '/board/category/view-thread?categoryId&threadId',
			views: {
				'navbar': {
						templateUrl: './partials/navbar.html'
					},
				'body': {
					templateUrl: './partials/thread.html',
					controller: 'basicThreadCtrl',
				},
				'thread-view@view-thread': {
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
	console.log("Yo")
	$scope.category = category.data;
	$scope.newThread = { parent : $scope.category};
	$scope.newPost = {};
	$scope.createThread = function(){
		// $scope.newThread.parent = $scope.category;
		threadFactory.createThread($scope.newThread, function(thread){
			$scope.newPost.parent = thread;
			postFactory.createPost($scope.newPost, function(){
				$location.path('/board/category/view-thread').search('threadId', thread._id);
			});
		});
	}
}]);

threadModule.controller('basicThreadCtrl', ['$scope', 'threadFactory', 'postFactory', 'category', 'thread', function($scope, threadFactory, postFactory, category, thread){
	$scope.thread = thread.data;
	$scope.category = category.data;
	$scope.newPost = {};
	$scope.isEditationEnabled = false;
	$scope.editItemId = null;

	console.log($scope.thread);

	$scope.createPost = function(){
		$scope.newPost.parent = $scope.thread;
		postFactory.createPost($scope.newPost, function(data){
			$scope.thread.posts.push(data);
			$scope.newPost = {};
		});
	}

	$scope.updatePost = function(post){
		postFactory.updatePost(post, function(data){
			$scope.thread.posts[$scope.thread.posts.indexOf(post)] = data;
			$scope.enableEditation(false, null);
		});
	}

	$scope.deletePost = function(post){
		postFactory.deletePost(post._id, function(data){
			$scope.thread.posts[$scope.thread.posts.indexOf(post)] = data;
		});
	}

	$scope.quotePost = function(post){
		console.log("Not implemented yet.");
	}

	$scope.enableEditation = function(boolEnable, editItemId){
		$scope.isEditationEnabled = boolEnable;
		$scope.editItemId = editItemId;
	}
}]);
