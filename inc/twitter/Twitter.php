<?php
	require_once('twitteroauth.php');

	class Twitter {
		function Twitter() {
			$settings = json_decode(file_get_contents(__DIR__."/settings.json"), true);
			
			if(!defined('DEFAULT_ACCOUNT')) {
				define('DEFAULT_ACCOUNT', $settings["twitterAccount"]);
			}
			
			if(!defined('DEFAULT_HASHTAG')) {
				define('DEFAULT_HASHTAG', $settings["twitterHashtag"]);
			}
			
			if(!defined('TWEET_LIMIT')) {
				define('TWEET_LIMIT', $settings["tweetsLimit"]);
			}
			
			if(!defined('CONSUMER_KEY')) {
				define('CONSUMER_KEY', $settings["consumerKey"]);
			}
			
			if(!defined('CONSUMER_SECRET')) {
				define('CONSUMER_SECRET', $settings["consumerSecret"]);
			}
			
			if(!defined('ACCESS_TOKEN')) {
				define('ACCESS_TOKEN', $settings["accessToken"]);
			}
			
			if(!defined('ACCESS_TOKEN_SECRET')) {
				define('ACCESS_TOKEN_SECRET', $settings["accessTokenSecret"]);
			}
		}
	
		function loadDefaultAccountTweets() {
			return $this->loadTweets(DEFAULT_ACCOUNT, DEFAULT_HASHTAG);
		}
	
		function loadTweets($account, $hashtag) {
			$twitter = new TwitterOAuth(CONSUMER_KEY, CONSUMER_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET);
		
			//$tweets = $twitter->get('statuses/user_timeline', 
			//						array('screen_name' => $account, 
			//								'exclude_replies' => 'true', 
			//								'include_rts' => 'true', 
			//								'count' => TWEET_LIMIT));
											
			$tweets = $twitter->get('search/tweets', 
									array('q' => "$%23hashtag+from:$account", 
											'count' => TWEET_LIMIT));
											echo "$%23hashtag+from:$account";
			var_dump($tweets);							
			if (!empty($tweets)) {
				$processed_tweets = array();
		
				foreach($tweets as $tweet) {
					// Si es un retweet
					if (property_exists($tweet, 'retweeted_status'))
						$tweet = $tweet->retweeted_status;
				
					$text = $this->processTweetText($tweet);
				
					$date = date("j M Y", strtotime($tweet->created_at));
					
					$username = $tweet->user->name;
					$screen_name =  $tweet->user->screen_name;
					$account_image = $tweet->user->profile_image_url;
					$language = $tweet->lang;
				
					$tweet = array(
						'content' => $text,
						'account' => array(
							'name' => $username,
							'displayName' => $screen_name,
							'img' => $account_image
						)
					);
				
					array_push($processed_tweets, $tweet);
				}
			
				return $processed_tweets;
			}
										
			return null;
		}
	
		function processTweetText($tweet) {
			$replace_index = array();
		
			$text = $tweet->text;
		
			if (property_exists($tweet, 'entities') ) {
				foreach ($tweet->entities as $area => $items) {
				
					foreach ($items as $item) {
						$entity = $this->processEntity($area, $item);
						$href = $entity['href'];
						$string = $entity['string'];
						$prefix = $entity['prefijo'];
					
						if (!(strpos($href, 'http://') === 0)) 
							$href = "http://".$href;
						
						$index = substr($text, $item->indices[0], $item->indices[1]-$item->indices[0]);
						$replace = "<a class=\"enlace\" href=\"$href\">{$prefix}{$string}</a>";
						$replace_index[$index] = $replace;
					}
				}
			
				foreach ($replace_index as $replace => $with) 
					$text = str_replace($replace, $with, $text);
			}
		
			return $text;
		}
	
		function processEntity($area, $item) {
			$href = '';
			$string = '';
		
			switch ( $area ) {
				case 'hashtags':
					$prefix = '#';
					$url = 'http://twitter.com/search/?src=hash&q=%23';
					$string = $item->text;
					$href = $url.$string;
					break;
				case 'user_mentions':
					$prefix = '@';
					$url = 'http://twitter.com/';
					$string = $item->screen_name;
					$href = $url.$string;
					break;
				case 'media': 
				case 'urls':
					$prefix = '';
					$url = '';
					$string = $item->display_url;
					$href = $item->expanded_url;
					break;
				default: 
					break;
			}
		
			return array('href' => $href, 'string' => $string, 'prefijo' => $prefix);
		}
	}
?>
